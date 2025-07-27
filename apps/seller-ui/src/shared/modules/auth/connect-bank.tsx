import axios from 'axios';
import { PiggyBank } from 'lucide-react';

interface ConnectBankProps {
  sellerId: string;
}
export const ConnectBank = ({ sellerId }: ConnectBankProps) => {
  const connectStripe = async () => {
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URI}/api/create-stripe-link`, {
        sellerId,
      });

      if (response?.data?.url) {
        window.location.href = response?.data?.url;
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="text-center">
      <h3 className="text-2xl font-semibold mb-4">Connect Your Bank Account</h3>
      <p className="text-gray-500 mb-4">
        To start selling, you need to connect your bank account. This will allow you to receive payments from your
        customers.
      </p>
      <button
        className="w-full m-auto flex items-center justify-center gap-2 bg-primary text-white px-4 py-2 rounded-md"
        onClick={connectStripe}
      >
        <PiggyBank />
        Connect Bank
      </button>
    </div>
  );
};
