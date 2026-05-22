const express =
require("express");

const router =
express.Router();

const {

createBusinessProfile,

getBusinessProfile,

updateBusinessProfile,

saveBusinessProfile,

deleteBusinessProfile

}
=
require("../controllers/businessController");

const authMiddleware =
require("../middleware/authMiddleware");

router.post(
"/create",
authMiddleware,
createBusinessProfile
);

router.get(
"/me",
authMiddleware,
getBusinessProfile
);

router.put(
"/update",
authMiddleware,
updateBusinessProfile
);

router.post(
"/save",
authMiddleware,
saveBusinessProfile
);

router.delete(
"/delete",
authMiddleware,
deleteBusinessProfile
);
module.exports =
router;