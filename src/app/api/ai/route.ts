import { NextApiRequest, NextApiResponse } from "next";
import { fetchDifyResponse } from "../../../lib/dify";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const { query } = req.body;

    try {
      const response = await fetchDifyResponse(query);
      res.status(200).json(response);
    } catch (error) {
      res.status(500).json({ error: "Dify API request failed" });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
