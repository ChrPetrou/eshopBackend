"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const joi_1 = __importDefault(require("joi"));
var router = (0, express_1.Router)();
const registerSchema = joi_1.default.object({
    username: joi_1.default.string().alphanum().min(3).max(30).required(),
    email: joi_1.default.string().email({
        minDomainSegments: 2,
        tlds: { allow: ["com", "net"] },
    }),
    password: joi_1.default.string().pattern(new RegExp("^[a-zA-Z0-9]{3,30}$")),
});
const LoginSchema = joi_1.default.object({
    username: joi_1.default.string().alphanum().min(3).max(30).required(),
    email: joi_1.default.string().email({
        minDomainSegments: 2,
        tlds: { allow: ["com", "net"] },
    }),
    password: joi_1.default.string().pattern(new RegExp("^[a-zA-Z0-9]{3,30}$")),
});
router.post("/register", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { value, error } = registerSchema.validate(req.body);
    if (error) {
        return res.send(error.details).status(400);
    }
    return res.json(value).status(200);
}));
exports.default = router;
