const User = require("../../models/user")

module.exports = {
  /**
   * @swagger
   * /user/{id}:
   *   get:
   *     summary: Get user details
   *     tags: [User]
   *     parameters:
   *       - in: path
   *         name: id
   *         schema:
   *           type: string
   *         required: true
   *         description: The user ID
   *     responses:
   *       200:
   *         description: The user description by id
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/User'
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
   *       500:
   *        description: Some server error
   *     security:
   *       - bearerAuth: []
   */
  async get(req, res) {
    try {
      const { id } = req.params
      const user = await User.findOne({
          _id: id
        })
        .select("-password -forgotpassword")
        .exec()
      if (user === null) throw new Error("No user found for the given id")
      return res.json({
        error: false,
        user
      })
    } catch (err) {
      return res.status(500).json({
        error: true,
        reason: err.message
      })
    }
  }
}