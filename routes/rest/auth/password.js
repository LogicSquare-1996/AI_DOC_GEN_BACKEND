const moment = require("moment")
const cuid = require("cuid")

const mail = require("../../../lib/mail")

const User = require("../../../models/user")

module.exports = {
  /**
   * @swagger
   * /forgotpassword:
   *   post:
   *     summary: Request to get password reset link in mail
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
   *                 description: The user's email.
   *                 example: "myEmail@logic-square.com"
   *     responses:
   *       200:
   *         description: The password reset link was sent successfully.
   *         content:
   *           application/json:
   *             examples:
   *               application/json:
   *                 value:
   *                   error: false
   *                   handle: "myEmail@logic-square.com"
   *       500:
   *         description: Some server error.
   */
  async startWorkflow(req, res) {
    try {
      const { handle } = req.body
      const user = await User.findOne({ email: handle }).exec()
      if (user === null) {
        throw new Error(
          "User not found, please check your email address and try again"
        )
      }
      if (!user.isActive) {
        throw new Error(
          "Oops, there is a problem with your account. Please contact admin"
        )
      }
      const now = Date.now()
      const token = cuid.slug()
      user.forgotpassword = {
        requestedAt: now,
        token,
        expiresAt: moment(now)
          .add(65, "minutes")
          .toDate()
      }
      await user.save()
      try {
        await mail("forgot-password", {
          to: user.email,
          subject: "Password Reset Instructions",
          locals: {
            userName: user.name.full,
            email: user.email,
            url: `${process.env.SITE_URL}/resetpassword/${token}`
          }
        })
      } catch (mailErr) {
        console.log("==> Mail sending Error: ", mailErr)
        throw new Error(
          "Failed to send Password Reset Email! Please Retry Later."
        )
      }
      return res.status(200).json({ error: false, handle })
    } catch (error) {
      return res.status(500).json({ error: true, reason: error.message })
    }
  },

  /**
   * @swagger
   * /resetpassword:
   *   post:
   *     summary: Request to set a new password
   *     tags: [Auth]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               token:
   *                 type: string
   *                 description: The password reset token.
   *               password:
   *                 type: string
   *                 description: The new password.
   *               email:
   *                 type: string
   *                 description: The user's email.
   *     responses:
   *       200:
   *         description: The password was reset successfully.
   *         content:
   *           application/json:
   *             examples:
   *               application/json:
   *                 value:
   *                   error: false
   *                   email: "myEmail@logic-square.com"
   *       500:
   *         description: Some server error.
   */
  async resetPassword(req, res) {
    try {
      const { token, password, email } = req.body
      // if (/(?=.*([\d]|[\@\!\#\$\%\^\&\*\-\_\+\\\.\,\;\=])).{8,}/.test(password) === false) { // eslint-disable-line no-useless-escape
      //   throw new Error("Password should have length of at least 8 with one special character or number!")
      // }
      const user = await User.findOne({
        "forgotpassword.token": token,
        "forgotpassword.expiresAt": { $gte: new Date() },
        email
      }).exec()
      if (user === null) throw new Error("Invalid or Expired Token")
      // if (user === null) throw new Error("User not found, please check your email address and try again")
      if (!user.isActive) {
        throw new Error(
          "Oops, there is a problem with your account. Please contact admin"
        )
      }
      user.password = password
      user.lastModifiedAt = Date.now()
      user.forgotpassword = {
        requestedAt: null,
        token: null,
        expiresAt: null
      }
      await user.save()
      return res.status(200).json({ error: false, email })
    } catch (error) {
      return res.status(500).json({ error: true, reason: error.message })
    }
  }
}
