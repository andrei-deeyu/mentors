const http = require('http-status-codes')
const User = require('../models/user')
const statusMsg = require('../config/statusMsg')
const tokenGenerator = require('./authTokenGenerator')
const email_verify = require('./emailVerify')
const { validationResult } = require('express-validator/check')
const bcrypt = require('bcrypt')
const SALTING = 10

exports.reauthorize = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(http.UNPROCESSABLE_ENTITY).json({
      "success": statusMsg.fail.msg,
      "payload": {},
      "error": {
        "code": http.UNPROCESSABLE_ENTITY,
        "message": errors.array()
      }
    })
  }
  try {
    let hash = await bcrypt.hash(req.body.password, SALTING)
    const access_token = await tokenGenerator.access_token(req.body.email)
    const user = new User({
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      email: req.body.email,
      password: hash,
    })
    await user.save()
    host = req.get('host')
    await email_verify.verifyEmail(user.email, user.first_name, host, access_token)
    const response = {
      "data": user,
      "message": statusMsg.email.msg + user.email + '.'
    }
    res.status(http.CREATED).json({
      "success": statusMsg.success.msg,
      "payload": response
    })
  }
  catch (err) {
    console.log(err)
    err.status = http.CONFLICT
    next(err)
  }
}