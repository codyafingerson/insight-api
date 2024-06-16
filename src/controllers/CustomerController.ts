import { type Request, type Response } from "express";
import expressAsyncHandler from "express-async-handler";
import Customer from "../models/Customer";
import MailService from "../util/MailService";

export default class CustomerController {
    public static createCustomer = expressAsyncHandler(async (req: Request, res: Response) => {
        const {
            isActive,
            firstName,
            lastName,
            email,
            phoneNumber,
            address,
            companyName,
            companyAddress,
            companyPhoneNumber,
            gender,
            dateOfBirth,
            preferredLanguage,
            isEmailAllowed,
            notes
        } = req.body;

        if (!firstName || !lastName || !email || !phoneNumber || !address) {
            res.status(400);
            throw new Error("Please provide all required fields.");
        }

        const customer = new Customer({
            isActive,
            firstName,
            lastName,
            email,
            phoneNumber,
            address,
            companyName,
            companyAddress,
            companyPhoneNumber,
            gender,
            dateOfBirth,
            preferredLanguage,
            isEmailAllowed,
            notes: [notes]
        });

        const createdCustomer = await customer.save();

        if (createdCustomer) {
            if (isEmailAllowed) {
                const mailService = new MailService();

                await mailService.sendMail(email, "Welcome to the Insight CRM!", "blank", {
                    body: `Hello ${firstName} ${lastName},\n\nWelcome to the Insight CRM!`
                });
            }

            res.status(201).json(createdCustomer);
        } else {
            res.status(400);
            throw new Error("Invalid customer data.");
        }


    });

    public static getAllCustomers = expressAsyncHandler(async (req: Request, res: Response) => {
        const customers = await Customer.find({});

        if (customers) {
            res.status(200).json(customers);
        } else {
            res.status(404);
            throw new Error("No customers found.");
        }
    });

    public static getCustomerById = expressAsyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;

        const customer = await Customer.findById(id);

        if (customer) {
            res.status(200).json(customer);
        } else {
            res.status(404);
            throw new Error("Customer not found.");
        }
    });

    public static searchCustomers = expressAsyncHandler(async (req: Request, res: Response) => {
        let { filter } = req.query;

        // Ensure filter is a string
        if (typeof filter !== 'string') {
            filter = '';
        }

        const customers = await Customer.find({ $text: { $search: filter } });

        if (customers) {
            res.status(200).json(customers);
        } else {
            res.status(404);
            throw new Error("No customers found.");
        }
    });

    public static updateCustomer = expressAsyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;
        const {
            isActive,
            firstName,
            lastName,
            email,
            phoneNumber,
            address,
            companyName,
            companyAddress,
            companyPhoneNumber,
            gender,
            dateOfBirth,
            preferredLanguage,
            isEmailAllowed,
            notes
        } = req.body;

        const customer = await Customer.findById(id);

        if (customer) {
            customer.isActive = isActive || customer.isActive;
            customer.firstName = firstName || customer.firstName;
            customer.lastName = lastName || customer.lastName;
            customer.email = email || customer.email;
            customer.phoneNumber = phoneNumber || customer.phoneNumber;
            customer.address = address || customer.address;
            customer.companyName = companyName || customer.companyName;
            customer.companyAddress = companyAddress || customer.companyAddress;
            customer.companyPhoneNumber = companyPhoneNumber || customer.companyPhoneNumber;
            customer.gender = gender || customer.gender;
            customer.dateOfBirth = dateOfBirth || customer.dateOfBirth;
            customer.preferredLanguage = preferredLanguage || customer.preferredLanguage;
            customer.isEmailAllowed = isEmailAllowed || customer.isEmailAllowed;

            // Notes is a string array, so we need to check if the notes field is an array
            if (Array.isArray(notes)) {
                customer.notes = notes;
            } else {
                customer.notes = [notes];
            }

            const updatedCustomer = await customer.save();

            if (updatedCustomer) {
                res.status(200).json(updatedCustomer);
            } else {
                res.status(400);
                throw new Error("Invalid customer data.");
            }
        } else {
            res.status(404);
            throw new Error("Customer not found.");
        }
    });

    public static deleteCustomer = expressAsyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;

        const customer = await Customer.findByIdAndDelete(id);

        if (customer) {
            res.status(200).json({ message: "Customer deleted." });
        } else {
            res.status(404);
            throw new Error("Customer not found.");
        }
    });

    public static sendEmail = expressAsyncHandler(async (req: Request, res: Response) => {
        const { id } = req.params;
        const { subject, body } = req.body;

        const customer = await Customer.findById(id);

        if (customer) {
            const mailService = new MailService();

            await mailService.sendMail(customer.email, subject, "blank", { body });

            res.status(200).json({ message: "Email sent." });
        } else {
            res.status(404);
            throw new Error("Customer not found.");
        }
    });

    public static sendEmailToAllCustomers = expressAsyncHandler(async (req: Request, res: Response) => {
        const { subject, body } = req.body;

        const customers = await Customer.find({});

        if (customers) {
            const mailService = new MailService();

            for (const customer of customers) {
                await mailService.sendMail(customer.email, subject, "blank", { body });
            }

            res.status(200).json({ message: "Email sent to all customers." });
        } else {
            res.status(404);
            throw new Error("No customers found.");
        }
    });
}