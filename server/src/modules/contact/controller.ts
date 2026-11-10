// server/src/modules/contact/controller.ts
import { Request, Response, NextFunction } from "express"
import * as contactService from "./service"

export async function submitContact(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await contactService.createContactMessage(req.body)
    res.status(201).json({ data: result })
  } catch (err) {
    next(err)
  }
}
