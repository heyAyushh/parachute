import { withIronSessionApiRoute } from "iron-session/next";
import { NextApiRequest, NextApiResponse } from "next";
import { sessionOptions, withSessionRoute } from "../../lib/withSession";

export type User = {
  id: string | boolean;
  // admin?: boolean;
  address?: string | boolean;
  isLoggedIn: boolean;
};

export default withSessionRoute(userRoute);

async function userRoute(req: NextApiRequest, res: NextApiResponse<User>) {
  if (req.session?.user?.id) {
    // in a real world application you might read the user id from the session and then do a database request
    // to get more information on the user if needed
    res.json({
      ...req.session.user,
      isLoggedIn: true,
    });
  } else {
    res.json({
      isLoggedIn: false,
      id: false,
      address: false,
    });
  }
}