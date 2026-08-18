import { WorkflowTemplate } from '../types';

export const WORKFLOW_TEMPLATES: WorkflowTemplate[] = [
  {
    id: 'cyberpunk',
    name: '赛博朋克雨夜街道',
    category: '科幻视觉',
    description: '从赛博朋克文本描述 -> 高精度光影图像 -> 电影感运镜视频',
    initialPrompt: '未来赛博朋克城市雨夜，霓虹招牌在湿漉漉的地面投射出倒影，一辆悬浮飞车穿过迷雾，具有虚幻引擎5真实光照与体积光。',
    imageStyle: 'cinematic',
    videoMovement: 'zoom_in',
  },
  {
    id: 'nature_crane',
    name: '青绿山水仙鹤云海',
    category: '国风美学',
    description: '水墨写意与国风工笔，云雾翻腾的苍山之巅仙鹤展翅',
    initialPrompt: '中国传统青绿山水画风，晨曦薄雾缭绕的奇峰绝顶，一只展翅欲飞的金顶白鹤，金光穿透流云，意境悠远祥和。',
    imageStyle: 'oriental_ink',
    videoMovement: 'pan_right',
  },
  {
    id: 'deep_space',
    name: '深空星际漫游者',
    category: '太空史诗',
    description: '宇航员在异星水晶矿脉前凝望银河星云',
    initialPrompt: '孤独的宇航员站在散发荧光的紫水晶地表，头盔面罩上映照出璀璨旋转的螺旋星系，星尘飘散，IMAX写实胶片质感。',
    imageStyle: 'scifi_epic',
    videoMovement: 'cinematic_drift',
  },
  {
    id: 'anime_meadow',
    name: '吉卜力暖阳花海',
    category: '动漫治愈',
    description: '微风拂过夏日草甸与蓝天白云的清新瞬间',
    initialPrompt: '阳光明媚的夏日原野，风车在起伏的绿色草丘上缓缓转动，繁花盛开，动漫吉卜力电影画风，温暖治愈的柔和光线。',
    imageStyle: 'anime_ghibli',
    videoMovement: 'orbit',
  },
];
