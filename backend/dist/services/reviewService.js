"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.approveExistingReview = exports.deleteExistingReview = exports.updateExistingReview = exports.createNewReview = exports.fetchReviewById = exports.fetchAllReviews = void 0;
const client_1 = require("@prisma/client");
const aiService_1 = require("./aiService");
const prisma = new client_1.PrismaClient();
const fetchAllReviews = async () => {
    return await prisma.review.findMany({
        orderBy: { createdAt: 'desc' }
    });
};
exports.fetchAllReviews = fetchAllReviews;
const fetchReviewById = async (id) => {
    return await prisma.review.findUnique({
        where: { id }
    });
};
exports.fetchReviewById = fetchReviewById;
const createNewReview = async (data) => {
    // Auto generate AI reply if not provided
    let aiReply = data.aiReply;
    if (!aiReply) {
        aiReply = await (0, aiService_1.generateAIReply)(data.reviewText, data.rating, data.reviewerName);
    }
    return await prisma.review.create({
        data: {
            reviewerName: data.reviewerName,
            rating: data.rating,
            reviewText: data.reviewText,
            aiReply: aiReply,
            status: data.status || 'pending'
        }
    });
};
exports.createNewReview = createNewReview;
const updateExistingReview = async (id, data) => {
    return await prisma.review.update({
        where: { id },
        data
    });
};
exports.updateExistingReview = updateExistingReview;
const deleteExistingReview = async (id) => {
    return await prisma.review.delete({
        where: { id }
    });
};
exports.deleteExistingReview = deleteExistingReview;
const approveExistingReview = async (id) => {
    return await prisma.review.update({
        where: { id },
        data: { status: 'approved' }
    });
};
exports.approveExistingReview = approveExistingReview;
