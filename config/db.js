import mongoose from 'mongoose';
import colors from 'colors';

export const db = async () => {
    try {
        console.log('MONGO_URI:', process.env.MONGO_URI);
        const db = await mongoose.connect(process.env.MONGO_URI)
        const url = `${db.connection.host}:${db.connection.port}`;
        console.log(colors.green.italic.bold(`MongoDB successfully connected: ${url}`));
    } catch (error) {
        console.log(colors.red.italic.bold(`Error: ${error.message}`));
        process.exit(1);
    }
}