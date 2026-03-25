import mountainRetreatImg from '@assets/generated_images/mountain_yoga_retreat_location.png';
import teacherPortraitImg from '@assets/generated_images/friendly_female_yoga_teacher_portrait_in_nature.png';
import retreatStudioImg from '@assets/generated_images/serene_yoga_studio_overlooking_forest_at_sunrise.png';
import ciraliBeachImg from '@assets/generated_images/tropical_beach_yoga_retreat_location.png';
import nepalAnastasiaBoudhanathNightImg from '@assets/nepal/nepal-anastasia-boudhanath-night.png';
import nepalBoudhanathCloseImg from '@assets/nepal/nepal-boudhanath-close.jpg';
import nepalBoudhanathWideImg from '@assets/nepal/nepal-boudhanath-wide.jpg';
import nepalMonksTempleImg from '@assets/nepal/nepal-monks-temple.jpg';
import nepalPatanDurbarImg from '@assets/nepal/nepal-patan-durbar.jpg';

const assetUrlByKey: Record<string, string> = {
  'cirali-beach': ciraliBeachImg,
  'mountains-retreat': mountainRetreatImg,
  'retreat-studio': retreatStudioImg,
  'teacher-portrait': teacherPortraitImg,
  'nepal-boudhanath-close': nepalBoudhanathCloseImg,
  'nepal-boudhanath-wide': nepalBoudhanathWideImg,
  'nepal-patan-durbar': nepalPatanDurbarImg,
  'nepal-anastasia-boudhanath-night': nepalAnastasiaBoudhanathNightImg,
  'nepal-monks-temple': nepalMonksTempleImg,
};

export function getRetreatAssetUrl(assetKey: string): string {
  return assetUrlByKey[assetKey] ?? '';
}

