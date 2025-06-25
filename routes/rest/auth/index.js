const jwt = require("jsonwebtoken")

const User = require("../../../models/user")

module.exports = {
  /**
   * @swagger
   * /login:
   *   post:
   *     summary: User login
   *     tags: [Auth]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               handle:
   *                 type: string
   *                 description: The user's email or phone number.
   *                 example: "myEmail@logic-square.com"
   *               password:
   *                 type: string
   *                 description: The user's password.
   *                 example: "myNewPassword"
   *     responses:
   *       200:
   *         description: The user was logged in successfully.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: boolean
   *                   example: false
   *                 handle:
   *                   type: string
   *                   example: "myEmail@logic-square.com"
   *                 token:
   *                   type: string
   *                   example: "authToken.abc.xyz"
   *             examples:
   *               application/json:
   *                 value:
   *                   error: false
   *                   handle: "myEmail@logic-square.com"
   *                   token: "authToken.abc.xyz"
   *       400:
   *         description: Bad request.
   *       500:
   *         description: Some server error.
   */
  async post(req, res) {
    try {
      // const { type } = req.params
      const {
        handle,
        password
      } = req.body
      if (handle === undefined || password === undefined) {
        return res.status(400).json({
          error: true,
          reason: "Fields `handle` and `password` are mandatory"
        })
      }
      const user = await User.findOne({
        $or: [{
          email: handle.toLowerCase()
        }, {
          phone: handle
        }]
      }).exec()
      if (user === null) throw new Error("User Not Found")
      if (user.isActive === false) throw new Error("User Inactive")
      // check pass
      await user.comparePassword(password)
      // No error, send jwt
      const payload = {
        id: user._id,
        _id: user._id,
        fullName: user.name.full,
        email: user.email,
        phone: user.phone,
        isAdmin: user.isAdmin
      }
      const token = jwt.sign(payload, process.env.SECRET, {
        expiresIn: 3600 * 24 * 30 // 1 month
      })
      return res.json({
        error: false,
        handle,
        token
      })
    } catch (err) {
      return res.status(500).json({
        error: true,
        reason: err.message
      })
    }
  }
}