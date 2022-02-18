'use strict';

const AWS = require('aws-sdk')
const sharp = require('sharp')
const { basename, extname } = require('path')
const S3 = new AWS.S3()
module.exports.handle = async ({Records: records}, context) => {
  try {
    await Promise.all(records.map(async record => {
      const { key } = record.s3.object;

      const image = await S3.getObject({
        Bucket: process.env.bucket,
        Key: key
      }).promise() // amazon utiliza padrao de callback antigo, necesasrio .promise() em todas as funcs q tem await

      const optimized = await sharp(image.Body)
        .resize(1280, 720, { fit: 'inside', withoutEnlargement: true}) // nunca deixa passar 1280, 720 sem distorcer a imagem
        .toFormat('jpeg', {progressive: true, quality: 50})
        .toBuffer()
      }));

      await S3.putObject({
        Body: optimized,
        Bucket: process.env.bucket,
        ContentType: 'image/jpeg',
        Key: `compressed/${basename(key, extname(key))}.jpg`
        /*
        basename -> remove o path, deixando apenas o nome da imagem
        extname -> pega a extensao
        nome-da-imagem.jpeg
        */
      }).promise()

    return {
      statusCode: 201,
      body: { success: true}
    }
  } catch(err) {
    return err;
  }
};
