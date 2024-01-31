import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";

const TOPIC_ARN = process.env.TOPIC_ARN || "";
const API_KEY = process.env.API_KEY || "";
const END_POINT = "https://api.nytimes.com/svc/books/v3/lists.json";
const LISTS = [
  "childrens-middle-grade",
  "young-adult",
  "trade-fiction-paperback",
];

type Book = {
  title: string;
  description: string;
  author: string;
};

type APIResponse = {
  copyright: string;
  num_results: number;
  results: [
    {
      amazon_product_url: string;
      book_details: Book[];
    }
  ];
};

export const handler = async (): Promise<any> => {
  let mailBody = "";
  for (const list of LISTS) {
    mailBody += "";
    mailBody +=
      "+-----------------------------------------------------------+" + "\r\n";
    mailBody += "■" + list + "\r\n";
    mailBody +=
      "+-----------------------------------------------------------+" + "\r\n";

    const response = await fetch(
      `${END_POINT}?list=${list}&api-key=${API_KEY}`
    );
    const apiResponse: APIResponse = await response.json();
    for (const result of apiResponse.results) {
      mailBody += `『${result.book_details[0].title}』by ${result.book_details[0].author}\r\n`;
      mailBody += `${result.book_details[0].description}\r\n`;
      mailBody += `${result.amazon_product_url}\r\n\r\n`;
    }
    await new Promise((resolve) => setTimeout(resolve, 12000));
  }

  // メール送信
  const client = new SNSClient({});
  const input = {
    TopicArn: TOPIC_ARN,
    Subject: "!!new!!【自動配信】The New York Times Best Sellers",
    Message: mailBody,
  };
  const command = new PublishCommand(input);
  await client.send(command);
};
