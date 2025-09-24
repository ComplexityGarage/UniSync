import QRCode from 'qrcode'
import { Jimp } from 'jimp'
import { intToRGBA } from '@jimp/utils'

const QR_CODE_SIZE = 64

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: number }> }
) {
  const { id } = await params

  const data = await QRCode.toBuffer(
    'https://www.facebook.com/garageofcomplexity',
    {
      width: QR_CODE_SIZE,
      margin: 1
    }
  )

  const image = await Jimp.read(data)

  image.threshold({ max: 128 })

  const buffer = await image.getBuffer('image/bmp')

  const byteArray = []

  for (let y = 0; y < QR_CODE_SIZE; y++) {
    for (let x = 0; x < QR_CODE_SIZE; x += 8) {
      let byte = 0
      for (let bit = 0; bit < 8; bit++) {
        const px = x + bit
        if (px >= QR_CODE_SIZE) continue
        const pixelColor = image.getPixelColor(px, y)
        const { r } = intToRGBA(pixelColor)
        const isBlack = r < 128
        byte |= (isBlack ? 1 : 0) << (7 - bit)
      }
      byteArray.push(byte)
    }
  }

  return Response.json({
    width: QR_CODE_SIZE,
    height: QR_CODE_SIZE,
    data: [...byteArray]
  })
}
