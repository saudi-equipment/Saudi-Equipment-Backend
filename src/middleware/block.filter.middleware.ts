// import { Injectable, NestMiddleware } from '@nestjs/common';
// import { Request, Response, NextFunction } from 'express';
// import { UserService } from 'src/user/user.service';
// import { IUser } from 'src/interfaces/user';

// // Extend the Request interface to include blockedUsers
// declare module 'express' {
//   interface Request {
//     blockedUsers?: string[]; // Array of blocked user IDs
//   }
// }

// @Injectable()
// export class BlockFilterMiddleware implements NestMiddleware {
//   constructor(private readonly userService: UserService) {}

//   async use(req: Request, res: Response, next: NextFunction) {
//     const user = req.user as IUser; // Assuming you have the current user's ID from the request (e.g., via authentication middleware)
//     console.log('USER>>>>>>>>>>>>>>>>>>>>', user);

//     // Fetch the current user's blockedUsers list
//     const currentUser = await this.userService.findUserById(user.id); // Use _id instead of id
//     if (!currentUser) {
//       return next();
//     }

//     // Attach the blockedUsers list to the request object
//     req.blockedUsers = currentUser.blockedUsers.map((id) => id.toString()); // Convert ObjectId to string

//     // Modify the query to exclude blocked users and their ads
//     if (req.method === 'GET') {
//       if (req.query.filter !== 'false') {
//         // Add a query parameter to bypass the filter if needed
//         if (req.path.includes('/users')) {
//           req.query._id = { $nin: req.blockedUsers }; // Exclude blocked users
//         } else if (req.path.includes('/ads')) {
//           req.query.user = { $nin: req.blockedUsers }; // Exclude ads from blocked users
//         }
//       }
//     }

//     next();
//   }
// }
