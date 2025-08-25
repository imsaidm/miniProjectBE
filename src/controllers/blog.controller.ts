import { NextFunction, Response, Request } from "express";

class BlogController {
  public createBlog(req: Request, res: Response, next: NextFunction) {
    try {
      res
        .status(201)
        .json({ message: "Blog created successfully", data: req.body });
    } catch (error) {
      next(error);
    }
  }
}

export default BlogController;
