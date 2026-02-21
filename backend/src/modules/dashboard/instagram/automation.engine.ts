import { prisma } from "../../../config/db.config";
import logger from "../../../utils/logger";
import { sendDm } from "./instagram.utils";

/**
 * The Automation Engine is responsible for processing incoming triggers (webhooks)
 * from Meta and executing the corresponding rules (e.g. sending a DM).
 * 
 * Future scalability:
 * - processStoryReplyWebhook
 * - processDmKeywordWebhook
 */
export class AutomationEngine {

    /**
     * Entry point for comment webhooks.
     * Matches the comment text against active rules for the specific media and sends the configured DM.
     */
    async processCommentWebhook(payload: {
        igUserId: string;
        mediaId: string;
        commentId: string;
        commentText: string;
        commenterId: string;
        commenterUsername?: string;
    }) {
        const { igUserId, mediaId, commentId, commentText, commenterId, commenterUsername } = payload;

        // Find the connected account
        const account = await prisma.instagramAccount.findUnique({
            where: { igUserId },
        });

        if (!account) {
            logger.warn(`AutomationEngine: No account found for IG user ${igUserId}`);
            return;
        }

        // Find matching active rules for this media
        const rules = await prisma.automationRule.findMany({
            where: {
                instagramAccountId: account.id,
                mediaId,
                status: "ACTIVE",
            },
        });

        if (rules.length === 0) return;

        const upperComment = commentText.trim().toUpperCase();

        for (const rule of rules) {
            // Check if comment contains the trigger keyword
            if (upperComment.includes(rule.triggerKeyword.toUpperCase())) {
                try {
                    // Execute the action (Send DM)
                    const buttons = rule.dmButtons as Array<{ title: string; url: string }> | null;
                    await sendDm(
                        igUserId,
                        commentId,
                        commenterId,
                        rule.dmMessage,
                        rule.dmType as "TEXT" | "TEMPLATE",
                        buttons,
                        account.accessToken
                    );

                    // Log Success
                    await prisma.automationLog.create({
                        data: {
                            ruleId: rule.id,
                            commenterId,
                            commenterUsername: commenterUsername || null,
                            commentText,
                            dmStatus: "SENT",
                        },
                    });

                    // Update Rule Stats
                    await prisma.automationRule.update({
                        where: { id: rule.id },
                        data: {
                            dmsSentCount: { increment: 1 },
                            lastTriggeredAt: new Date(),
                        },
                    });

                    logger.info(`AutomationEngine: DM sent to ${commenterUsername || commenterId} via rule #${rule.id}`);
                } catch (err: any) {
                    const isRateLimit = err.message?.includes("rate") || err.message?.includes("limit");

                    await prisma.automationLog.create({
                        data: {
                            ruleId: rule.id,
                            commenterId,
                            commenterUsername: commenterUsername || null,
                            commentText,
                            dmStatus: isRateLimit ? "RATE_LIMITED" : "FAILED",
                            errorMessage: err.message || "Unknown error",
                        },
                    });

                    logger.error(`AutomationEngine: DM failed for rule #${rule.id}: ${err.message}`);
                }
            }
        }
    }
}

export const automationEngine = new AutomationEngine();
