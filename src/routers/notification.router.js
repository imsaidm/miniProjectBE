"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const notification_controller_1 = __importDefault(require("../controllers/notification.controller"));
const router = (0, express_1.Router)();
router.post('/', notification_controller_1.default.sendNotification);
router.get('/', notification_controller_1.default.listUserNotifications);
exports.default = router;
//# sourceMappingURL=notification.router.js.map