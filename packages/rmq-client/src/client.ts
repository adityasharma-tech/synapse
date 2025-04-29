import { env } from "@pkgs/zod-client";
import amqp from "amqplib";

class RMQClient {
    private connection?: amqp.ChannelModel;
    public channel?: amqp.Channel;
    constructor() {}

    async connect() {
        this.connection = await amqp.connect(
            env.RABBITMQ_URI ?? "amqp://localhost"
        );
        this.channel = await this.connection.createChannel();
    }

    async assertQueue(queueName: string) {
        if (!this.channel) await this.connect();
        await (this.channel as amqp.Channel).assertQueue(queueName, {
            durable: true,
        });
    }

    async getChannel() {
        if (!this.channel) await this.connect();
        return this.channel as amqp.Channel;
    }
}

export { RMQClient };
