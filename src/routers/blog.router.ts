import { Router } from "express";
import BlogController from "../controllers/blog.controller";
import { verifyAuthor } from "../middleware/verifyRole";
import { Token } from "../middleware/token";

class BlogRouter {
  private route: Router;
  private blogController: BlogController;

  constructor() {
    this.route = Router();
    this.blogController = new BlogController();
    this.initializeRoute();
  }
  private initializeRoute(): void {
    this.route.post(
      "/create",
      Token,
      verifyAuthor,
      this.blogController.createBlog
    );
  }

  public getRouter(): Router {
    return this.route;
  }
}

export default BlogRouter;
