"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.approveReview = exports.deleteReview = exports.updateReview = exports.createReview = exports.getReviewById = exports.getAllReviews = void 0;
const reviewService_1 = require("../services/reviewService");
const getAllReviews = async (req, res) => {
    try {
        const reviews = await (0, reviewService_1.fetchAllReviews)();
        res.json(reviews);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch reviews' });
    }
};
exports.getAllReviews = getAllReviews;
const getReviewById = async (req, res) => {
    try {
        const review = await (0, reviewService_1.fetchReviewById)(Number(req.params.id));
        if (!review)
            return res.status(404).json({ error: 'Review not found' });
        res.json(review);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch review' });
    }
};
exports.getReviewById = getReviewById;
const createReview = async (req, res) => {
    try {
        const review = await (0, reviewService_1.createNewReview)(req.body);
        res.status(201).json(review);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to create review' });
    }
};
exports.createReview = createReview;
const updateReview = async (req, res) => {
    try {
        const review = await (0, reviewService_1.updateExistingReview)(Number(req.params.id), req.body);
        res.json(review);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update review' });
    }
};
exports.updateReview = updateReview;
const deleteReview = async (req, res) => {
    try {
        await (0, reviewService_1.deleteExistingReview)(Number(req.params.id));
        res.json({ message: 'Review deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to delete review' });
    }
};
exports.deleteReview = deleteReview;
const approveReview = async (req, res) => {
    try {
        const review = await (0, reviewService_1.approveExistingReview)(Number(req.params.id));
        res.json(review);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to approve review' });
    }
};
exports.approveReview = approveReview;
