import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config()

const WEBHOOK_URL = process.env.WEBHOOK_URL
const API_URL = process.env.API_URL

let lastObject = null;

const sendWebhookMessage = async (embed) => {
    try {
        const response = await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ embeds: [embed] }),
        });

        if (response.ok) {
            console.log('Webhook message sent successfully.');
        } else {
            console.error(`Failed to send webhook message: ${response.status} - ${await response.text()}`);
        }
    } catch (error) {
        console.error('Error sending webhook message:', error);
    }
};

const checkAPIData = async () => {
    try {
        const response = await fetch(API_URL);
        const data = await response.json();

        if (data.length === 0) {
            return;
        }

        const latestObject = data[0];

        if (!lastObject) {
            lastObject = latestObject;
            return;
        }

        if (JSON.stringify(latestObject) !== JSON.stringify(lastObject)) {
            var buyer = latestObject.buyer;
            switch (latestObject.buyer) {
                case process.env.AXIONATOR_WALLET:
                    buyer = "Axionator";
                    break;
                case process.env.DING_WALLET:
                    buyer = "dingadoodle";
                    break;
                case process.env.LIME_WALLET:
                    buyer = "lemon";
                    break;
                case process.env.SIM_WALLET:
                    buyer = "sim needs a nickname";
                    break;
                case process.env.ZAK_WALLET:
                    buyer = "zak the top g";
                    break;
                default:
                    buyer = latestObject.buyer;
            }

                const embed = {
                title: "New Snipe",
                fields: [
                    { name: "Name", value: latestObject.name },
                    { name: "Price", value: `${latestObject.price/1000000000} SOL` },
                    { name: "Buyer", value: buyer },
                    { name: "Tier", value: latestObject.tier },
                    { name: "Tx", value: `[View Transaction](https://solscan.io/tx/${latestObject.signature})` }
                ],
                image: { url: latestObject.image }
            };

            await sendWebhookMessage(embed);

            lastObject = latestObject;
        }
    } catch (error) {
        console.error('Error checking API data:', error);
    }
};

// Periodically check the API data
setInterval(checkAPIData, 5000); // Check every 5 seconds
