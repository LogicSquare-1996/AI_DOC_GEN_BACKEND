const User = require("../../../models/user")

module.exports = {
  /**
   * @swagger
   * /signup:
   *   post:
   *     summary: User registration
   *     tags: [Auth]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               email:
   *                 type: string
   *                 description: The user's email.
   *                 example: "myEmail@logic-square.com"
   *               phone:
   *                 type: string
   *                 description: The user's phone number.
   *                 example: "00000000000"
   *               name:
   *                 type: object
   *                 properties:
   *                   first:
   *                     type: string
   *                     example: "Jhon"
   *                   last:
   *                     type: string
   *                     example: "Doe"
   *               password:
   *                 type: string
   *                 description: The user's password.
   *                 example: "myNewPassword"
   *     responses:
   *       200:
   *         description: The user was registered successfully.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: boolean
   *                   example: false
   *                 user:
   *                   type: object
   *                   properties:
   *                     email:
   *                       type: string
   *                     phone:
   *                       type: string
   *                     name:
   *                       type: object
   *                       properties:
   *                         first:
   *                           type: string
   *                         last:
   *                           type: string
   *             examples:
   *               application/json:
   *                 value:
   *                   error: false
   *                   user:
   *                     email: "myEmail@logic-square.com"
   *                     phone: "00000000000"
   *                     name:
   *                       first: "Jhon"
   *                       last: "Doe"
   *       400:
   *         description: Bad request.
   *       500:
   *         description: Some server error.
   */
  async post(req, res) {
    try {
      const {
        email, phone, name, password
      } = req.body
      if (email === undefined) {
        return res
          .status(400)
          .json({ error: true, reason: "Missing manadatory field `email`" })
      }
      if (name === undefined || name.first === undefined) {
        return res
          .status(400)
          .json({ error: true, reason: "Please specify First Name!" })
      }
      let user = await User.create({
        email,
        phone,
        password,
        name
      })
      user = user.toObject()
      delete user.password
      delete user.forgotpassword

      return res.json({ error: false, user })
    } catch (err) {
      return res.status(500).json({ error: true, reason: err.message })
    }
  }
}
