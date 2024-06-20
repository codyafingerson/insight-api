import express, { type Application } from 'express';
import session from 'express-session';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import morgan from 'morgan';
import cors from 'cors';
import Database from './config/Database';
import errorHandler from './middleware/errorHandler';

// Add routes
import authRouter from "./routes/authRoutes";
import userRouter from './routes/userRoutes';
import customerRouter from "./routes/customerRoutes";

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

app.use(session({
    secret: process.env.SESSION_SECRET as string,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true
    }
}));

app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: "Insight CRM Web API"
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