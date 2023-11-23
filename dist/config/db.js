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
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const connectDB = () => __awaiter(void 0, void 0, void 0, function* () {
    dotenv_1.default.config();
    const MONGOURL = process.env.MONGOURL;
    console.log("====================================");
    console.log("hi");
    console.log("====================================");
    try {
        yield mongoose_1.default.connect(`${MONGOURL}`);
    }
    catch (error) {
        // console.error(error.message);
        process.exit(1);
    }
    const dbConnection = mongoose_1.default.connection;
    dbConnection.once("open", (_) => {
        console.log(`Database connected: `);
    });
    dbConnection.on("error", (err) => {
        console.error(`connection error: ${err}`);
    });
    return;
});
exports.default = connectDB;
