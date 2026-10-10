from pathlib import Path
from io import BytesIO
import hashlib
import json
import shutil
import sys

from PIL import Image, ImageChops, ImageCms, ImageOps


ROOT = Path(__file__).resolve().parent
INPUT = Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / 'source'
SOURCE = ROOT / 'source'
READY = ROOT / 'ready'
SOURCE.mkdir(parents=True, exist_ok=True)
READY.mkdir(parents=True, exist_ok=True)
SRGB = ImageCms.createProfile('sRGB')
SRGB_BYTES = ImageCms.ImageCmsProfile(SRGB).tobytes()

PHOTO_SPECS = [
    {
        'id': 'sunsetBreath',
        'sourceName': '2026-10-10 15.51.45.jpg',
        'filename': 'shore-breath-silhouette.webp',
        'alt': {'ru': 'Силуэт женщины во время дыхательной практики на берегу у низкого солнца.',
                'en': 'A woman practicing breathing on the shore, silhouetted against the low sun.'},
        'recommendedObjectPosition': '50% 45%',
        'whatUsedFor': ['hero breathing tiles', 'About scattered breathing print'],
        'cropGuidance': 'Keep the hand near the face and seated silhouette visible. The original is monochrome; do not colorize it.',
    },
    {
        'id': 'paddleboardYoga',
        'sourceName': '2026-10-10 15.52.11.jpg',
        'filename': 'braided-paddleboard-yoga.webp',
        'alt': {'ru': 'Женщина с косами сидит на голубой доске на воде и поднимает соединённые ладони.',
                'en': 'A woman with braids sits on a blue paddleboard and raises her joined palms.'},
        'recommendedObjectPosition': '50% 50%',
        'whatUsedFor': ['optional hero movement tile', 'additional real practice photograph'],
        'cropGuidance': 'Keep raised hands, head, and the board together when the slot allows.',
    },
    {
        'id': 'prayerFlagsPortrait',
        'sourceName': 'ZVC03615.jpg',
        'filename': 'teacher-and-monk-prayer-flags.webp',
        'alt': {'ru': 'Женщина и монах перед разноцветными молитвенными флажками.',
                'en': 'A woman and a monk in front of colorful prayer flags.'},
        'recommendedObjectPosition': '50% 55%',
        'whatUsedFor': ['additional real photograph for future editorial use'],
        'cropGuidance': 'Keep both faces; this is not the current About portrait reference.',
    },
    {
        'id': 'rockPose',
        'sourceName': 'ZVC05159.JPG',
        'filename': 'rock-seated-portrait.webp',
        'alt': {'ru': 'Женщина в солнцезащитных очках сидит на рыжих скалах под голубым небом.',
                'en': 'A woman in sunglasses sits on orange rocks beneath a blue sky.'},
        'recommendedObjectPosition': '50% 50%',
        'whatUsedFor': ['optional hero rocks tile', 'About scattered rocks print'],
        'cropGuidance': 'The source shows a seated portrait on rocks, not a yoga asana. Preserve the face and bent knee.',
    },
    {
        'id': 'oceanMovement',
        'sourceName': 'ZVC05224.JPG',
        'filename': 'ocean-backbend.webp',
        'alt': {'ru': 'Женщина выполняет прогиб на скалах у океана, рядом с набегающими волнами.',
                'en': 'A woman performs a backbend on coastal rocks beside breaking ocean waves.'},
        'recommendedObjectPosition': '50% 65%',
        'whatUsedFor': ['hero movement and sea-detail tiles', 'About scattered movement print', 'classes photograph'],
        'cropGuidance': 'Use the full lower figure for classes. Upper sea-only crops can provide real wave detail tiles.',
    },
    {
        'id': 'rockStanding',
        'sourceName': 'ZVC05307.JPG',
        'filename': 'rock-standing-portrait.webp',
        'alt': {'ru': 'Женщина стоит среди тёмных прибрежных скал на фоне океана.',
                'en': 'A woman stands among dark coastal rocks with the ocean behind her.'},
        'recommendedObjectPosition': '50% 50%',
        'whatUsedFor': ['optional hero rocks tile', 'additional real coastal photograph'],
        'cropGuidance': 'Keep the standing figure within the natural rock opening.',
    },
    {
        'id': 'mirrorPortrait',
        'sourceName': 'nastya (251 of 269).jpg',
        'filename': 'braided-mirror-portrait.webp',
        'alt': {'ru': 'Женщина с косами сидит у стены из зеркальной мозаики и смотрит в камеру.',
                'en': 'A woman with braids sits by a mirrored mosaic wall and looks at the camera.'},
        'recommendedObjectPosition': '50% 38%',
        'whatUsedFor': ['optional hero portrait tile', 'additional real portrait'],
        'cropGuidance': 'Prioritize the face and braids; the mosaic is part of the original photo.',
    },
    {
        'id': 'studioBackbend',
        'sourceName': 'nastya (29 of 269).jpg',
        'filename': 'studio-low-lunge-backbend.webp',
        'alt': {'ru': 'Женщина с длинными косами выполняет глубокий прогиб в выпаде в светлой студии.',
                'en': 'A woman with long braids performs a deep backbend in a low lunge in a bright studio.'},
        'recommendedObjectPosition': '50% 65%',
        'whatUsedFor': ['optional hero movement tile', 'additional real classes photograph'],
        'cropGuidance': 'Keep the entire lunge and both supporting legs. Upper half contains useful empty studio space.',
    },
    {
        'id': 'braidedPortrait',
        'sourceName': 'telegram-cloud-document-4-5983426692197126973.jpg',
        'filename': 'braided-seated-portrait.webp',
        'alt': {'ru': 'Анастасия с длинными косами сидит со скрещёнными ногами у серой стены.',
                'en': 'Anastasia with long braids sits cross-legged against a grey wall.'},
        'recommendedObjectPosition': '50% 42%',
        'whatUsedFor': ['hero face, seated figure, hands, and torso tiles', 'About main full-color portrait'],
        'cropGuidance': 'Use face and upper torso for About. Natural foreground leaves remain in the source and ready file.',
    },
    {
        'id': 'waterfallMeditation',
        'sourceName': 'telegram-cloud-photo-size-4-5776394464237653992-y.jpg',
        'filename': 'waterfall-meditation.webp',
        'alt': {'ru': 'Два человека в бордовых одеждах сидят на камнях у водопада.',
                'en': 'Two people in burgundy robes sit on rocks beside a waterfall.'},
        'recommendedObjectPosition': '50% 62%',
        'whatUsedFor': ['additional real photograph for future editorial use'],
        'cropGuidance': 'Keep both people and the waterfall. Do not use in the current About composition.',
    },
]

assets = []
for spec in PHOTO_SPECS:
    input_file = INPUT / spec['sourceName']
    source_file = SOURCE / spec['sourceName']
    if input_file.resolve() != source_file.resolve():
        shutil.copy2(input_file, source_file)
    source_hash = hashlib.sha256(source_file.read_bytes()).hexdigest()
    with Image.open(source_file) as source_image:
        raw_size = list(source_image.size)
        orientation = source_image.getexif().get(274, 1)
        exif_color_space = source_image.getexif().get_ifd(34665).get(40961)
        input_icc = source_image.info.get('icc_profile')
        image = ImageOps.exif_transpose(source_image)
        oriented_size = list(image.size)
        if input_icc:
            input_profile = ImageCms.ImageCmsProfile(BytesIO(input_icc))
            input_profile_name = ImageCms.getProfileName(input_profile).strip()
            image = ImageCms.profileToProfile(image, input_profile, SRGB, outputMode='RGB')
            color_conversion = 'embedded ICC converted to sRGB'
        else:
            input_profile_name = None
            image = image.convert('RGB')
            color_conversion = (
                'EXIF sRGB retained and explicitly tagged' if exif_color_space == 1
                else 'untagged RGB assumed sRGB and explicitly tagged'
            )
        channels = image.split()
        monochrome = (
            ImageChops.difference(channels[0], channels[1]).getextrema()[1] == 0
            and ImageChops.difference(channels[0], channels[2]).getextrema()[1] == 0
        )
        image.thumbnail((1800, 1800), Image.Resampling.LANCZOS, reducing_gap=3.0)
        output_file = READY / spec['filename']
        image.save(output_file, 'WEBP', quality=84, method=6, icc_profile=SRGB_BYTES)
    with Image.open(output_file) as output_image:
        output_image.load()
        assert max(output_image.size) <= 1800
        assert output_image.width <= oriented_size[0] and output_image.height <= oriented_size[1]
        assert 'A' not in output_image.getbands()
        assert output_image.info.get('icc_profile')
        ready_width, ready_height = output_image.size
    assert hashlib.sha256(input_file.read_bytes()).hexdigest() == source_hash
    asset = {k: v for k, v in spec.items() if k != 'filename'}
    asset.update({
        'sourceFile': str(source_file),
        'inputFile': str(input_file),
        'readyFile': str(output_file),
        'readyRelative': f"ready/{spec['filename']}",
        'width': ready_width,
        'height': ready_height,
        'bytes': output_file.stat().st_size,
        'sourceBytes': source_file.stat().st_size,
        'sourceRawSize': raw_size,
        'sourceOrientedSize': oriented_size,
        'sourceExifOrientation': orientation,
        'sourceExifColorSpace': exif_color_space,
        'sourceProfile': input_profile_name,
        'sourceMonochrome': monochrome,
        'colorConversion': color_conversion,
        'colorSpace': 'sRGB',
        'alpha': False,
        'sourceSha256': source_hash,
        'readySha256': hashlib.sha256(output_file.read_bytes()).hexdigest(),
    })
    assets.append(asset)

hero_tiles = [{'tile': 1, 'assetId': 'braidedPortrait', 'objectPosition': '50% 38%'}, {'tile': 2, 'assetId': 'sunsetBreath', 'objectPosition': '50% 55%'}, {'tile': 3, 'assetId': 'oceanMovement', 'objectPosition': '50% 82%'}, {'tile': 4, 'assetId': 'prayerFlagsPortrait', 'objectPosition': '50% 48%'}, {'tile': 5, 'assetId': 'studioBackbend', 'objectPosition': '50% 56%'}, {'tile': 6, 'assetId': 'mirrorPortrait', 'objectPosition': '50% 35%'}, {'tile': 7, 'assetId': 'waterfallMeditation', 'objectPosition': '50% 62%'}, {'tile': 8, 'assetId': 'rockPose', 'objectPosition': '50% 35%'}, {'tile': 9, 'assetId': 'rockStanding', 'objectPosition': '50% 35%'}, {'tile': 10, 'assetId': 'paddleboardYoga', 'objectPosition': '50% 55%'}]

manifest = {
    'id': 'real-photos',
    'projectRoot': str(ROOT.parents[2]),
    'assetRoot': str(ROOT),
    'inputDirectory': str(INPUT),
    'compositionReference': str(ROOT.parents[1] / 'layout' / 'full-page-v2.png'),
    'generation': False,
    'processing': {
        'library': 'Pillow',
        'exifTranspose': True,
        'outputColorSpace': 'sRGB',
        'webpQuality': 84,
        'webpMethod': 6,
        'maxLongEdge': 1800,
        'upscale': False,
        'retouch': False,
        'crop': False,
        'blackAndWhite': 'CSS only; sunsetBreath is already monochrome in its supplied original',
    },
    'keyAssets': {
        'braidedPortrait': 'braidedPortrait',
        'oceanMovement': 'oceanMovement',
        'rockPose': 'rockPose',
        'sunsetBreath': 'sunsetBreath',
    },
    'sunsetBreathAvailability': {
        'available': True,
        'sourceIsMonochrome': True,
        'colorVersionAvailable': False,
        'notes': 'Low sun and a breathing silhouette are visible. Sunrise versus sunset cannot be established from the image alone.',
    },
    'assets': assets,
    'heroTiles': hero_tiles,
    'heroTileGuidance': '10 unique real photographs, each used once in an irregular responsive mosaic. Geometry: HeroSection.module.css.',
    'checks': {
        'originalCount': len(assets),
        'readyCount': len(assets),
        'allSourcesByteIdenticalToInput': True,
        'allReadyFilesDecode': True,
        'allReadyFilesSrgbTagged': True,
        'allReadyFilesOpaque': True,
        'noUpscale': True,
    },
}
(ROOT / 'manifest.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n')
print(json.dumps({'assets': [{'id': a['id'], 'size': [a['width'], a['height']], 'bytes': a['bytes'], 'sourceMonochrome': a['sourceMonochrome']} for a in assets], 'readyBytes': sum(a['bytes'] for a in assets), 'sourceBytes': sum(a['sourceBytes'] for a in assets)}, ensure_ascii=False, indent=2))
