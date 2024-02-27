"use server";

import Question from "@/database/question.model";
import Tag from "@/database/tags.model";
import { connectToDatabase } from "../mongoose";

export async function createQuestion(params: any) {
  // eslint-disable-next-line no-empty
  try {
    connectToDatabase();

    const { title, content, tags, author, path } = params;

    // Create a new question
    const question = await Question.create({
      title,
      content,
      author,
    });

    const tagDocuments = [];

    // create the tags or get them if they already exist
    for (const tag of tags) {
      const existingTag = await Tag.findOneAndUpdate(
        { name: { $regex: new RegExp(`^${tag}$`, "i") } },
        { $setOnInsert: { name: tag }, $push: { question: question._id } },
        { $upsert: true, new: true }
      );

      tagDocuments.push(existingTag._id);
    }

    // update the question
    await Question.findByIdAndUpdate(question._id, {
      $push: { tags: { $each: tagDocuments } },
    });

    // create an interaction record for the users ask question action

    // increment authors reputation by +5 points for question
  } catch (error) {}
}
