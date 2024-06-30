import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import express, { type Application } from 'express';
import morgan from 'morgan';
import Database from './config/Database';
import errorHandler from './middleware/errorHandler';

// Add routes
import authRouter from "./routes/authRoutes";
import customerRouter from "./routes/customerRoutes";
import userRouter from './routes/userRoutes';

// Load environment variables
dotenv.config();

const app: Application = express();
const port: number = parseInt(process.env.PORT || '3000');
const db: Database = new Database(process.env.MONGO_URI as string);

db.connect();

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

app.use(cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser(process.env.COOKIE_SECRET as string));

app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: "Insight CMS Web API",
        version: "2.0.0",
        endpoints: {
            auth: "/api/auth",
            users: "/api/users",
            customers: "/api/customers"
        },
        documentation: "see source code"
    });
});

app.use('/api/auth', authRouter);
app.use('/api/users', userRouter);
app.use('/api/customers', customerRouter);

app.get("*", (req, res) => {
    res.status(404).json({
        success: false,
        message: "Resource not found"
    });
});

app.use(errorHandler);

app.listen(port, () => {
    console.log(`Server is running on port ${port} (http://localhost:${port})`);
});

export default app;