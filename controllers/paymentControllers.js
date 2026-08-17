import crypto from 'crypto';
import Payment from "../models/paymentModel.js"
import razorpay from "../index.js"
import User from "../models/userModel.js"




const allPayments = async (req, res) => {
    try {
        const { count } = req.query

        const allPayments = await razorpay.subscriptions.all({
            count: count || 10
        })

        const monthNames = [
            'January',
            'February',
            'March',
            'April',
            'May',
            'June',
            'July',
            'August',
            'September',
            'October',
            'November',
            'December',
        ];

        const finalMonths = {
            January: 0,
            February: 0,
            March: 0,
            April: 0,
            May: 0,
            June: 0,
            July: 0,
            August: 0,
            September: 0,
            October: 0,
            November: 0,
            December: 0,
        };

        const activeSubscriptions = allPayments.items?.filter((item) => {
            return (item.status === "active" || item.status === "completed")
        })

        const monthlyWisePayments = activeSubscriptions.map((payment) => {
            // We are using payment.start_at which is in unix time, so we are converting it to Human readable format using Date()
            const monthsInNumbers = new Date(payment.start_at * 1000);

            return monthNames[monthsInNumbers.getMonth()];
        });

        monthlyWisePayments.map((month) => {
            Object.keys(finalMonths).forEach((objMonth) => {
                if (month === objMonth) {
                    finalMonths[month] += 1;
                }
            });
        });

        const monthlySalesRecord = [];

        Object.keys(finalMonths).forEach((monthName) => {
            monthlySalesRecord.push(finalMonths[monthName]);
        });

        res.status(200).json({
            success: true,
            message: "All Subscriptions listed below",
            allPayments,
            finalMonths,
            monthlySalesRecord,
            subscriptionCount: activeSubscriptions?.length || 0
        })
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        })
    }
}


const getRazorpayKey = async (req, res) => {
    try {
        res.status(200).json({
            success: true,
            message: "Razorpay API key",
            key: process.env.RAZORPAY_KEY
        })
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        })
    }
}


const buySubscription = async (req, res) => {
    try {
        const { planType } = req.body;

        if(!planType || !(planType === "monthly" || planType === "halfYearly" || planType === "yearly")){
            throw new Error('Please select a plan')
        }

        const user = await User.findById(req.user.id)

        let plan_id = (
            planType === "monthly" 
                ? process.env.RAZORPAY_MONTHLY_PLAN_ID 
                : planType === "halfYearly" 
                    ? process.env.RAZORPAY_HALF_YEARLY_PLAN_ID 
                    : planType === "yearly" 
                        ? process.env.RAZORPAY_YEARLY_PLAN_ID
                        : null
        )

        let total_count = (
            planType === "monthly" 
                ? 12 
                : planType === "halfYearly" 
                    ? 6 
                    : planType === "yearly" 
                        ? 1 
                        : null
        )

        const subscription = await razorpay.subscriptions.create({
            plan_id,
            customer_notify: 1,
            total_count
        })

        user.subscription.id = subscription.id
        user.subscription.status = subscription.status

        await user.save()

        res.status(200).json({
            success: true,
            subscription_id: subscription.id,
            message: "Congratulations, you are subscribed now"
        })
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        })
    }
}


const verifySubscription = async (req, res) => {
    try {
        const { id } = req.user
        const { razorpay_payment_id, razorpay_subscription_id, razorpay_signature } = req.body

        const user = await User.findById(id)

        const generatedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_SECRET)
            .update(`${razorpay_payment_id}|${razorpay_subscription_id}`)
            .digest('hex')

        if (generatedSignature !== razorpay_signature) {
            throw new Error("payment not verified, please try again")
        }

        await Payment.create(req.body)

        user.subscription.status = 'active'
        await user.save()

        res.status(200).json({
            success: true,
            message: "payment verified successfully",
            user
        })
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        })
    }
}


const cancelSubscription = async (req, res) => {
    try {
        const { id } = req.user

        const user = await User.findById(id)

        if (!user.subscription.id) {
            throw new Error("user is already not subscribed")
        }

        const subscription = await razorpay.subscriptions.cancel(user.subscription.id)

        user.subscription.id = undefined
        user.subscription.status = subscription.status

        await user.save()

        res.status(200).json({
            success: true,
            message: "subscription cancelled successfully",
            user
        })
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        })
    }
}


export { allPayments, getRazorpayKey, buySubscription, verifySubscription, cancelSubscription }