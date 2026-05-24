const router = require('express').Router();
const { authenticate } = require('../middleware/auth.middleware');
const {
  createCampaign,
  launchCampaign,
  listCampaigns,
  campaignStats,
  pauseCampaign,
  deleteCampaign
} = require('../controllers/campaign.controller');

router.use(authenticate);
router.get('/',            listCampaigns);
router.post('/',           createCampaign);
router.get('/:id/stats',   campaignStats);
router.post('/:id/launch', launchCampaign);
router.patch('/:id/pause', pauseCampaign);
router.delete('/:id',      deleteCampaign);

module.exports = router;