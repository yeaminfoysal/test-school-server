import mongoose from 'mongoose';

export const connectDB = async (): Promise<void> => {
    try {
        const mongoURI = process.env.MONGODB_URI as string;

        const conn = await mongoose.connect(mongoURI);

        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error('❌ Error connecting to MongoDB:', error);
        process.exit(1);
    }
};

// Handle MongoDB connection events
mongoose.connection.on('connected', () => {
    console.log('✅ Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
    console.error('❌ Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
    console.log('⚠️ Mongoose disconnected');
});

// Graceful shutdown
process.on('SIGINT', async () => {
    await mongoose.connection.close();
    console.log('✅ MongoDB connection closed through app termination');
    process.exit(0);
});