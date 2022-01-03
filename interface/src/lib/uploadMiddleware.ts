import nextConnect from 'next-connect'
import multiparty from 'multiparty'

const middleware = nextConnect()

middleware.use(async (req, res, next) => {
  const form = new multiparty.Form()

  await form.parse(req, function (err, fields, files) {
    // @ts-expect-error Incoming message types
    req.body = fields
    // @ts-expect-error Incoming message types
    req.files = files
    next()
  })
})

export default middleware