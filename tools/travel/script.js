// 中国省份地图路径数据（简化版）
const provincePaths = [
    {
        id: 'beijing',
        name: '北京',
        path: 'M750,200 L760,200 L760,210 L750,210 Z',
        centerX: 755,
        centerY: 205,
        area: 16410
    },
    {
        id: 'tianjin',
        name: '天津',
        path: 'M740,220 L750,220 L750,230 L740,230 Z',
        centerX: 745,
        centerY: 225,
        area: 11946
    },
    {
        id: 'hebei',
        name: '河北',
        path: 'M720,200 L780,200 L780,260 L720,260 Z',
        centerX: 750,
        centerY: 230,
        area: 188800
    },
    {
        id: 'shanxi',
        name: '山西',
        path: 'M680,250 L720,250 L720,300 L680,300 Z',
        centerX: 700,
        centerY: 275,
        area: 156700
    },
    {
        id: 'inner-mongolia',
        name: '内蒙古',
        path: 'M600,100 L800,100 L800,300 L600,300 Z',
        centerX: 700,
        centerY: 200,
        area: 1183000
    },
    {
        id: 'liaoning',
        name: '辽宁',
        path: 'M760,180 L790,180 L790,210 L760,210 Z',
        centerX: 775,
        centerY: 195,
        area: 148000
    },
    {
        id: 'jilin',
        name: '吉林',
        path: 'M770,150 L790,150 L790,180 L770,180 Z',
        centerX: 780,
        centerY: 165,
        area: 187400
    },
    {
        id: 'heilongjiang',
        name: '黑龙江',
        path: 'M750,100 L800,100 L800,150 L750,150 Z',
        centerX: 775,
        centerY: 125,
        area: 473000
    },
    {
        id: 'shanghai',
        name: '上海',
        path: 'M800,400 L810,400 L810,410 L800,410 Z',
        centerX: 805,
        centerY: 405,
        area: 6340
    },
    {
        id: 'jiangsu',
        name: '江苏',
        path: 'M770,350 L800,350 L800,390 L770,390 Z',
        centerX: 785,
        centerY: 370,
        area: 107200
    },
    {
        id: 'zhejiang',
        name: '浙江',
        path: 'M770,380 L800,380 L800,410 L770,410 Z',
        centerX: 785,
        centerY: 395,
        area: 105500
    },
    {
        id: 'anhui',
        name: '安徽',
        path: 'M740,350 L770,350 L770,390 L740,390 Z',
        centerX: 755,
        centerY: 370,
        area: 140100
    },
    {
        id: 'fujian',
        name: '福建',
        path: 'M770,410 L790,410 L790,440 L770,440 Z',
        centerX: 780,
        centerY: 425,
        area: 124000
    },
    {
        id: 'jiangxi',
        name: '江西',
        path: 'M720,380 L750,380 L750,420 L720,420 Z',
        centerX: 735,
        centerY: 400,
        area: 167900
    },
    {
        id: 'shandong',
        name: '山东',
        path: 'M740,280 L770,280 L770,320 L740,320 Z',
        centerX: 755,
        centerY: 300,
        area: 157900
    },
    {
        id: 'henan',
        name: '河南',
        path: 'M690,320 L730,320 L730,360 L690,360 Z',
        centerX: 710,
        centerY: 340,
        area: 167000
    },
    {
        id: 'hubei',
        name: '湖北',
        path: 'M670,370 L710,370 L710,410 L670,410 Z',
        centerX: 690,
        centerY: 390,
        area: 185900
    },
    {
        id: 'hunan',
        name: '湖南',
        path: 'M670,410 L710,410 L710,450 L670,450 Z',
        centerX: 690,
        centerY: 430,
        area: 211800
    },
    {
        id: 'guangdong',
        name: '广东',
        path: 'M700,470 L740,470 L740,520 L700,520 Z',
        centerX: 720,
        centerY: 495,
        area: 179800
    },
    {
        id: 'guangxi',
        name: '广西',
        path: 'M650,470 L690,470 L690,520 L650,520 Z',
        centerX: 670,
        centerY: 495,
        area: 247400
    },
    {
        id: 'hainan',
        name: '海南',
        path: 'M680,530 L690,530 L690,540 L680,540 Z',
        centerX: 685,
        centerY: 535,
        area: 35400
    },
    {
        id: 'sichuan',
        name: '四川',
        path: 'M580,380 L640,380 L640,440 L580,440 Z',
        centerX: 610,
        centerY: 410,
        area: 486000
    },
    {
        id: 'guizhou',
        name: '贵州',
        path: 'M600,440 L640,440 L640,480 L600,480 Z',
        centerX: 620,
        centerY: 460,
        area: 176200
    },
    {
        id: 'yunnan',
        name: '云南',
        path: 'M550,420 L610,420 L610,500 L550,500 Z',
        centerX: 580,
        centerY: 460,
        area: 394100
    },
    {
        id: 'tibet',
        name: '西藏',
        path: 'M400,300 L550,300 L550,500 L400,500 Z',
        centerX: 475,
        centerY: 400,
        area: 1228400
    },
    {
        id: 'shaanxi',
        name: '陕西',
        path: 'M620,320 L670,320 L670,370 L620,370 Z',
        centerX: 645,
        centerY: 345,
        area: 205600
    },
    {
        id: 'gansu',
        name: '甘肃',
        path: 'M550,280 L620,280 L620,350 L550,350 Z',
        centerX: 585,
        centerY: 315,
        area: 425900
    },
    {
        id: 'qinghai',
        name: '青海',
        path: 'M500,280 L550,280 L550,350 L500,350 Z',
        centerX: 525,
        centerY: 315,
        area: 722300
    },
    {
        id: 'ningxia',
        name: '宁夏',
        path: 'M600,320 L620,320 L620,340 L600,340 Z',
        centerX: 610,
        centerY: 330,
        area: 66400
    },
    {
        id: 'xinjiang',
        name: '新疆',
        path: 'M300,150 L500,150 L500,350 L300,350 Z',
        centerX: 400,
        centerY: 250,
        area: 1665000
    },
    {
        id: 'chongqing',
        name: '重庆',
        path: 'M620,400 L640,400 L640,420 L620,420 Z',
        centerX: 630,
        centerY: 410,
        area: 82400
    }
];

// 更完整的中国地图路径数据（简化但更真实的形状）
const chinaMapPaths = [
    // 华北地区
    { id: 'beijing', name: '北京', path: 'M740,190 L745,185 L755,185 L760,190 L760,200 L755,205 L745,205 L740,200 Z', type: 'province' },
    { id: 'tianjin', name: '天津', path: 'M765,195 L770,190 L775,195 L775,205 L770,210 L765,205 Z', type: 'province' },
    { id: 'hebei', name: '河北', path: 'M720,170 L780,170 L785,175 L790,190 L790,220 L785,235 L780,240 L720,240 L715,235 L710,220 L710,190 L715,175 Z', type: 'province' },
    { id: 'shanxi-north', name: '山西', path: 'M700,190 L720,190 L725,200 L725,220 L720,230 L700,230 L695,220 L695,200 Z', type: 'province' },
    { id: 'inner-mongolia', name: '内蒙古', path: 'M600,100 L650,100 L670,110 L690,130 L710,160 L730,180 L760,185 L790,185 L810,180 L830,160 L850,130 L870,110 L890,100 L900,120 L890,150 L870,180 L850,210 L830,240 L810,270 L790,290 L760,300 L730,300 L700,290 L670,270 L640,240 L610,210 L590,180 L570,150 L560,120 Z', type: 'province' },
    
    // 东北地区
    { id: 'liaoning', name: '辽宁', path: 'M770,170 L790,170 L795,180 L795,200 L790,210 L770,210 L765,200 L765,180 Z', type: 'province' },
    { id: 'jilin', name: '吉林', path: 'M780,150 L800,150 L805,160 L805,180 L800,190 L780,190 L775,180 L775,160 Z', type: 'province' },
    { id: 'heilongjiang', name: '黑龙江', path: 'M790,100 L840,100 L845,110 L845,140 L840,150 L790,150 L785,140 L785,110 Z', type: 'province' },
    
    // 华东地区
    { id: 'shanghai', name: '上海', path: 'M795,235 L800,230 L805,235 L805,245 L800,250 L795,245 Z', type: 'province' },
    { id: 'jiangsu', name: '江苏', path: 'M760,210 L785,210 L790,215 L790,230 L785,235 L760,235 L755,230 L755,215 Z', type: 'province' },
    { id: 'zhejiang', name: '浙江', path: 'M770,235 L795,235 L800,240 L800,255 L795,260 L770,260 L765,255 L765,240 Z', type: 'province' },
    { id: 'anhui', name: '安徽', path: 'M735,210 L760,210 L765,215 L765,230 L760,235 L735,235 L730,230 L730,215 Z', type: 'province' },
    { id: 'fujian', name: '福建', path: 'M775,260 L800,260 L805,265 L805,280 L800,285 L775,285 L770,280 L770,265 Z', type: 'province' },
    { id: 'shandong', name: '山东', path: 'M740,190 L765,190 L770,195 L770,210 L765,215 L740,215 L735,210 L735,195 Z', type: 'province' },
    
    // 中南地区
    { id: 'henan', name: '河南', path: 'M700,215 L735,215 L740,220 L740,235 L735,240 L700,240 L695,235 L695,220 Z', type: 'province' },
    { id: 'hubei', name: '湖北', path: 'M680,240 L715,240 L720,245 L720,260 L715,265 L680,265 L675,260 L675,245 Z', type: 'province' },
    { id: 'hunan', name: '湖南', path: 'M680,265 L715,265 L720,270 L720,285 L715,290 L680,290 L675,285 L675,270 Z', type: 'province' },
    { id: 'guangdong', name: '广东', path: 'M690,290 L725,290 L730,295 L730,310 L725,315 L690,315 L685,310 L685,295 Z', type: 'province' },
    { id: 'guangxi', name: '广西', path: 'M660,290 L690,290 L695,295 L695,310 L690,315 L660,315 L655,310 L655,295 Z', type: 'province' },
    { id: 'hainan', name: '海南', path: 'M695,320 L705,320 L710,325 L710,335 L705,340 L695,340 L690,335 L690,325 Z', type: 'province' },
    
    // 西南地区
    { id: 'chongqing', name: '重庆', path: 'M635,255 L645,255 L650,260 L650,270 L645,275 L635,275 L630,270 L630,260 Z', type: 'province' },
    { id: 'sichuan', name: '四川', path: 'M610,240 L650,240 L655,250 L655,280 L650,290 L610,290 L605,280 L605,250 Z', type: 'province' },
    { id: 'guizhou', name: '贵州', path: 'M620,275 L650,275 L655,280 L655,295 L650,300 L620,300 L615,295 L615,280 Z', type: 'province' },
    { id: 'yunnan', name: '云南', path: 'M590,270 L630,270 L635,280 L635,310 L630,320 L590,320 L585,310 L585,280 Z', type: 'province' },
    { id: 'tibet', name: '西藏', path: 'M500,220 L580,220 L585,240 L585,320 L580,340 L500,340 L495,320 L495,240 Z', type: 'province' },
    
    // 西北地区
    { id: 'shaanxi', name: '陕西', path: 'M640,215 L675,215 L680,220 L680,240 L675,245 L640,245 L635,240 L635,220 Z', type: 'province' },
    { id: 'gansu', name: '甘肃', path: 'M580,190 L640,190 L645,200 L645,250 L640,260 L580,260 L575,250 L575,200 Z', type: 'province' },
    { id: 'qinghai', name: '青海', path: 'M530,190 L580,190 L585,200 L585,250 L580,260 L530,260 L525,250 L525,200 Z', type: 'province' },
    { id: 'ningxia', name: '宁夏', path: 'M630,225 L645,225 L650,230 L650,240 L645,245 L630,245 L625,240 L625,230 Z', type: 'province' },
    { id: 'xinjiang', name: '新疆', path: 'M350,130 L520,130 L525,150 L525,280 L520,300 L350,300 L345,280 L345,150 Z', type: 'province' },
    
    // 主要城市（在省份内部）
    { id: 'beijing-city', name: '北京', path: 'M745,192 L755,192 L755,202 L745,202 Z', type: 'city', province: 'beijing' },
    { id: 'tianjin-city', name: '天津', path: 'M770,197 L775,197 L775,207 L770,207 Z', type: 'city', province: 'tianjin' },
    { id: 'shanghai-city', name: '上海', path: 'M797,237 L803,237 L803,247 L797,247 Z', type: 'city', province: 'shanghai' },
    { id: 'chongqing-city', name: '重庆', path: 'M637,257 L648,257 L648,272 L637,272 Z', type: 'city', province: 'chongqing' },
    { id: 'guangzhou-city', name: '广州', path: 'M692,292 L703,292 L703,307 L692,307 Z', type: 'city', province: 'guangdong' },
    { id: 'shenzhen-city', name: '深圳', path: 'M712,302 L723,302 L723,317 L712,317 Z', type: 'city', province: 'guangdong' },
    { id: 'chengdu-city', name: '成都', path: 'M612,242 L623,242 L623,257 L612,257 Z', type: 'city', province: 'sichuan' },
    { id: 'wuhan-city', name: '武汉', path: 'M682,242 L693,242 L693,257 L682,257 Z', type: 'city', province: 'hubei' },
    { id: 'xi-an-city', name: '西安', path: 'M642,217 L653,217 L653,232 L642,232 Z', type: 'city', province: 'shaanxi' },
    { id: 'hangzhou-city', name: '杭州', path: 'M772,237 L783,237 L783,252 L772,252 Z', type: 'city', province: 'zhejiang' },
    { id: 'nanjing-city', name: '南京', path: 'M762,212 L773,212 L773,227 L762,227 Z', type: 'city', province: 'jiangsu' },
    { id: 'shenyang-city', name: '沈阳', path: 'M777,172 L788,172 L788,187 L777,187 Z', type: 'city', province: 'liaoning' },
    { id: 'harbin-city', name: '哈尔滨', path: 'M815,125 L830,125 L830,145 L815,145 Z', type: 'city', province: 'heilongjiang' },
    { id: 'kunming-city', name: '昆明', path: 'M592,272 L608,272 L608,292 L592,292 Z', type: 'city', province: 'yunnan' }
];

// 中国城市数据（包含更多城市和对应的经纬度）
const chineseCities = [
    // 华北地区
    { id: 'beijing', name: '北京', longitude: 116.4074, latitude: 39.9042 },
    { id: 'tianjin', name: '天津', longitude: 117.1902, latitude: 39.1256 },
    { id: 'shijiazhuang', name: '石家庄', longitude: 114.5025, latitude: 38.0455 },
    { id: 'taiyuan', name: '太原', longitude: 112.5492, latitude: 37.8571 },
    { id: 'huhehaote', name: '呼和浩特', longitude: 111.6708, latitude: 40.8183 },
    
    // 东北地区
    { id: 'shenyang', name: '沈阳', longitude: 123.4315, latitude: 41.8057 },
    { id: 'dalian', name: '大连', longitude: 121.6186, latitude: 38.9146 },
    { id: 'changchun', name: '长春', longitude: 125.3245, latitude: 43.8869 },
    { id: 'haerbin', name: '哈尔滨', longitude: 126.5340, latitude: 45.8038 },
    
    // 华东地区
    { id: 'shanghai', name: '上海', longitude: 121.4737, latitude: 31.2304 },
    { id: 'nanjing', name: '南京', longitude: 118.7969, latitude: 32.0603 },
    { id: 'hangzhou', name: '杭州', longitude: 120.1551, latitude: 30.2741 },
    { id: 'suzhou', name: '苏州', longitude: 120.5853, latitude: 31.2989 },
    { id: 'wuxi', name: '无锡', longitude: 120.3017, latitude: 31.5747 },
    { id: 'ningbo', name: '宁波', longitude: 121.5497, latitude: 29.8683 },
    { id: 'jinan', name: '济南', longitude: 117.0009, latitude: 36.6758 },
    { id: 'qingdao', name: '青岛', longitude: 120.3552, latitude: 36.0753 },
    
    // 中南地区
    { id: 'zhengzhou', name: '郑州', longitude: 113.6654, latitude: 34.7578 },
    { id: 'wuhan', name: '武汉', longitude: 114.2986, latitude: 30.5844 },
    { id: 'changsha', name: '长沙', longitude: 112.9823, latitude: 28.1959 },
    { id: 'guangzhou', name: '广州', longitude: 113.2806, latitude: 23.1252 },
    { id: 'shenzhen', name: '深圳', longitude: 114.0579, latitude: 22.5431 },
    { id: 'nanning', name: '南宁', longitude: 108.3200, latitude: 22.8240 },
    { id: 'haikou', name: '海口', longitude: 110.3312, latitude: 20.0310 },
    
    // 西南地区
    { id: 'chongqing', name: '重庆', longitude: 106.5505, latitude: 29.5638 },
    { id: 'chengdu', name: '成都', longitude: 104.0659, latitude: 30.6595 },
    { id: 'guiyang', name: '贵阳', longitude: 106.6230, latitude: 26.6496 },
    { id: 'kunming', name: '昆明', longitude: 102.7123, latitude: 25.0406 },
    { id: 'lasa', name: '拉萨', longitude: 91.1322, latitude: 29.6604 },
    
    // 西北地区
    { id: 'xian', name: '西安', longitude: 108.9480, latitude: 34.2632 },
    { id: 'lanzhou', name: '兰州', longitude: 103.8236, latitude: 36.0580 },
    { id: 'xining', name: '西宁', longitude: 101.7789, latitude: 36.6232 },
    { id: 'yinchuan', name: '银川', longitude: 106.2782, latitude: 38.4664 },
    { id: 'wulumuqi', name: '乌鲁木齐', longitude: 87.6177, latitude: 43.7928 }
];

// 存储访问过的城市数据
let visitedCities = [];
let map;
let markers = [];
let infoWindows = [];

// 初始化应用
document.addEventListener('DOMContentLoaded', function() {
    // 检查用户是否已登录
    const currentUser = getCurrentUser();
    if (!currentUser) {
        // 未登录则跳转到登录页面
        window.location.href = '/login.html';
        return;
    }
    
    initializeMap();
    loadVisitedCities();
    setupEventListeners();
});

// 获取当前用户
function getCurrentUser() {
    try {
        return JSON.parse(localStorage.getItem('currentUser'));
    } catch (e) {
        return null;
    }
}

// 初始化高德地图
function initializeMap() {
    // 创建地图实例
    map = new AMap.Map('amap-container', {
        zoom: 4,
        center: [104.195397, 35.86166],
        mapStyle: 'amap://styles/normal'
    });
    
    // 添加地图控件
    AMap.plugin(['AMap.Scale', 'AMap.ToolBar'], function(){
        map.addControl(new AMap.Scale());
        map.addControl(new AMap.ToolBar());
    });
    
    // 添加点击事件监听器
    map.on('click', function(e) {
        // 点击地图时可以添加新城市
    });
}

// 加载访问过的城市数据
function loadVisitedCities() {
    const currentUser = getCurrentUser();
    if (!currentUser) return;
    
    // 从服务器加载数据
    fetch(`/api/visited-cities?userId=${currentUser.id}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('网络响应错误');
            }
            return response.json();
        })
        .then(data => {
            visitedCities = data;
            displayVisitedCities();
            updateMarkers();
        })
        .catch(error => {
            console.error('加载访问城市数据失败:', error);
            visitedCities = [];
        });
}

// 更新地图上的标记（只显示已访问的城市）
function updateMarkers() {
    // 清除现有标记
    clearMarkers();
    
    // 为每个已访问的城市添加标记
    visitedCities.forEach(city => {
        // 查找城市信息
        const cityInfo = chineseCities.find(c => c.id === city.city_id);
        if (cityInfo) {
            const marker = new AMap.Marker({
                position: [cityInfo.longitude, cityInfo.latitude],
                title: cityInfo.name,
                map: map,
                icon: createVisitedIcon()
            });
            
            // 添加信息窗口
            const infoWindow = new AMap.InfoWindow({
                content: createInfoWindowContent(cityInfo, true, city),
                offset: new AMap.Pixel(0, -30)
            });
            
            // 添加点击事件
            marker.on('click', function() {
                infoWindow.open(map, marker.getPosition());
                showCityModal(city.city_id, city.city_name, cityInfo.longitude, cityInfo.latitude);
            });
            
            markers.push(marker);
            infoWindows.push(infoWindow);
        }
    });
}

// 创建已访问标记图标
function createVisitedIcon() {
    return new AMap.Icon({
        size: new AMap.Size(25, 34),
        image: '//a.amap.com/jsapi_demos/static/demo-center/icons/poi-marker-green.png',
        imageSize: new AMap.Size(25, 34)
    });
}

// 创建信息窗口内容（只显示城市名称）
function createInfoWindowContent(city) {
    return `
        <div style="padding: 10px; min-width: 150px; text-align: center;">
            <h3 style="margin: 0;">${city.name}</h3>
        </div>
    `;
}

// 清除地图上的标记
function clearMarkers() {
    markers.forEach(marker => {
        if (marker.getMap()) {
            marker.setMap(null);
        }
    });
    markers = [];
    infoWindows = [];
}

// 显示访问过的城市列表
function displayVisitedCities() {
    const listContainer = document.getElementById('visited-cities-list');
    if (!listContainer) return;
    
    if (visitedCities.length === 0) {
        listContainer.innerHTML = '<p>您还没有访问过任何城市。</p>';
        return;
    }
    
    // 按访问日期排序（最新的在前）
    const sortedCities = [...visitedCities].sort((a, b) => 
        new Date(b.visit_date) - new Date(a.visit_date)
    );
    
    listContainer.innerHTML = sortedCities.map(city => `
        <div class="city-card" data-city-id="${city.city_id}">
            <h3>${city.city_name}</h3>
            <p>访问日期: ${formatDate(city.visit_date)}</p>
            <p class="rating">评价: ${'⭐'.repeat(city.rating)}</p>
            ${city.notes ? `<p>备注: ${city.notes}</p>` : ''}
        </div>
    `).join('');
    
    // 为每个城市卡片添加点击事件
    document.querySelectorAll('.city-card').forEach(card => {
        card.addEventListener('click', function() {
            const cityId = this.getAttribute('data-city-id');
            const cityInfo = chineseCities.find(c => c.id === cityId);
            if (cityInfo) {
                // 定位到城市位置
                map.setCenter([cityInfo.longitude, cityInfo.latitude]);
                map.setZoom(10);
                
                // 找到对应标记并打开信息窗口
                const markerIndex = markers.findIndex(marker => {
                    const pos = marker.getPosition();
                    return pos.lng === cityInfo.longitude && pos.lat === cityInfo.latitude;
                });
                
                if (markerIndex !== -1) {
                    const marker = markers[markerIndex];
                    const infoWindow = infoWindows[markerIndex];
                    if (infoWindow) {
                        infoWindow.open(map, marker.getPosition());
                    }
                }
            }
        });
    });
}

// 格式化日期
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN');
}

// 显示城市模态框
function showCityModal(cityId, cityName, longitude, latitude) {
    const modal = document.getElementById('city-modal');
    const cityNameElement = document.getElementById('modal-city-name');
    const cityIdInput = document.getElementById('city-id');
    
    if (!modal || !cityNameElement || !cityIdInput) return;
    
    // 设置城市信息
    cityNameElement.textContent = cityName || '新城市';
    cityIdInput.value = cityId || '';
    
    // 存储经纬度信息
    cityIdInput.setAttribute('data-longitude', longitude || '');
    cityIdInput.setAttribute('data-latitude', latitude || '');
    
    // 查找是否已访问过该城市
    const visitedCity = visitedCities.find(city => city.city_id === cityId);
    
    // 填充表单数据
    if (visitedCity) {
        const visitDateElement = document.getElementById('visit-date');
        const cityRatingElement = document.getElementById('city-rating');
        const attractionLevelElement = document.getElementById('attraction-level');
        const cityNotesElement = document.getElementById('city-notes');
        
        if (visitDateElement) visitDateElement.value = visitedCity.visit_date || '';
        if (cityRatingElement) cityRatingElement.value = visitedCity.rating || '';
        if (attractionLevelElement) attractionLevelElement.value = visitedCity.attraction_level || '';
        if (cityNotesElement) cityNotesElement.value = visitedCity.notes || '';
    } else {
        // 清空表单
        const visitDateElement = document.getElementById('visit-date');
        const cityRatingElement = document.getElementById('city-rating');
        const attractionLevelElement = document.getElementById('attraction-level');
        const cityNotesElement = document.getElementById('city-notes');
        
        if (visitDateElement) visitDateElement.value = '';
        if (cityRatingElement) cityRatingElement.value = '';
        if (attractionLevelElement) attractionLevelElement.value = '';
        if (cityNotesElement) cityNotesElement.value = '';
    }
    
    // 显示删除按钮（仅对已访问城市）
    const deleteButton = document.getElementById('delete-city');
    if (deleteButton) {
        deleteButton.style.display = visitedCity ? 'inline-block' : 'none';
        deleteButton.setAttribute('data-city-db-id', visitedCity ? visitedCity.id : '');
    }
    
    // 显示模态框
    modal.style.display = 'block';
}

// 设置事件监听器
function setupEventListeners() {
    // 关闭模态框
    const closeButtons = document.querySelectorAll('.close, .modal');
    closeButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            if (e.target === this) {
                document.getElementById('city-modal').style.display = 'none';
            }
        });
    });
    
    // 阻止模态框内容点击时关闭
    const modalContent = document.querySelector('.modal-content');
    if (modalContent) {
        modalContent.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    }
    
    // 表单提交
    const cityForm = document.getElementById('city-form');
    if (cityForm) {
        cityForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveCityVisit();
        });
    }
    
    // 删除城市
    const deleteButton = document.getElementById('delete-city');
    if (deleteButton) {
        deleteButton.addEventListener('click', function() {
            deleteCityVisit();
        });
    }
    
    // ESC键关闭模态框
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            document.getElementById('city-modal').style.display = 'none';
        }
    });
    
    // 添加城市按钮
    const addCityButton = document.getElementById('add-city');
    if (addCityButton) {
        addCityButton.addEventListener('click', function() {
            // 获取地图中心点作为新城市位置
            const center = map.getCenter();
            showCityModal('', '新城市', center.lng, center.lat);
        });
    }
    
    // 重置视图按钮
    const resetButton = document.getElementById('reset-view');
    if (resetButton) {
        resetButton.addEventListener('click', function() {
            map.setZoom(4);
            map.setCenter([104.195397, 35.86166]);
        });
    }
    
    // 查找最近的城市
    function findNearestCity(lng, lat) {
        let minDistance = Infinity;
        let nearestCity = null;
        
        chineseCities.forEach(city => {
            const distance = Math.sqrt(Math.pow(city.longitude - lng, 2) + Math.pow(city.latitude - lat, 2));
            if (distance < minDistance) {
                minDistance = distance;
                nearestCity = city;
            }
        });
        
        // 如果最近的城市在一定范围内，则认为是点击了该城市
        return minDistance < 1 ? nearestCity : null;
    }

    // 地图点击事件，用于添加新城市
    if (map) {
        map.on('click', function(e) {
            const lnglat = e.lnglat;
            // 查找最近的城市
            const nearestCity = findNearestCity(lnglat.getLng(), lnglat.getLat());
            if (nearestCity) {
                showCityModal(nearestCity.id, nearestCity.name, nearestCity.longitude, nearestCity.latitude);
            } else {
                showCityModal('', '新城市', lnglat.getLng(), lnglat.getLat());
            }
        });
    }
}

// 保存城市访问信息
function saveCityVisit() {
    const currentUser = getCurrentUser();
    if (!currentUser) {
        showCustomModal('错误', '请先登录', 'error');
        return;
    }
    
    const cityIdElement = document.getElementById('city-id');
    const visitDateElement = document.getElementById('visit-date');
    const cityRatingElement = document.getElementById('city-rating');
    const attractionLevelElement = document.getElementById('attraction-level');
    const cityNotesElement = document.getElementById('city-notes');
    const modalCityNameElement = document.getElementById('modal-city-name');
    
    if (!cityIdElement || !visitDateElement || !cityRatingElement || 
        !attractionLevelElement || !cityNotesElement || !modalCityNameElement) {
        showCustomModal('错误', '页面元素加载不完整，请刷新页面', 'error');
        return;
    }
    
    const cityId = cityIdElement.value;
    const visitDate = visitDateElement.value;
    const rating = cityRatingElement.value;
    const attractionLevel = attractionLevelElement.value;
    const notes = cityNotesElement.value;
    const longitude = cityIdElement.getAttribute('data-longitude');
    const latitude = cityIdElement.getAttribute('data-latitude');
    const cityName = modalCityNameElement.textContent;
    
    if (!visitDate || !rating) {
        showCustomModal('错误', '请填写访问日期和评价', 'warning');
        return;
    }
    
    // 准备城市访问数据
    const cityVisitData = {
        cityId: cityId || `city_${Date.now()}`,
        cityName: cityName,
        visitDate: visitDate,
        rating: parseInt(rating),
        attraction_level: attractionLevel || null,
        notes: notes,
        longitude: longitude,
        latitude: latitude
    };
    
    // 发送到服务器
    fetch(`/api/visited-cities?userId=${currentUser.id}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(cityVisitData)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('网络响应错误');
        }
        return response.json();
    })
    .then(data => {
        // 更新UI
        loadVisitedCities();
        
        // 关闭模态框
        document.getElementById('city-modal').style.display = 'none';
        
        // 显示成功提示模态框
        showCustomModal('保存成功', `城市"${cityName}"访问记录已成功保存！`, 'success');
    })
    .catch(error => {
        console.error('保存城市访问数据失败:', error);
        showCustomModal('保存失败', '保存城市访问记录时发生错误，请重试。', 'error');
    });
}

// 显示自定义模态框函数
function showCustomModal(title, message, type) {
    // 创建模态框元素
    const modal = document.createElement('div');
    modal.className = 'custom-modal-overlay';
    
    // 确定图标和样式
    let icon = '';
    let buttonClass = '';
    switch(type) {
        case 'success':
            icon = '✓';
            buttonClass = 'btn-success';
            break;
        case 'error':
            icon = '✗';
            buttonClass = 'btn-error';
            break;
        case 'warning':
            icon = '⚠';
            buttonClass = 'btn-warning';
            break;
        default:
            icon = 'ℹ';
            buttonClass = 'btn-info';
    }
    
    // 设置模态框内容
    modal.innerHTML = `
        <div class="custom-modal">
            <div class="modal-header">
                <span class="modal-icon ${type}">${icon}</span>
                <h3>${title}</h3>
                <span class="modal-close">&times;</span>
            </div>
            <div class="modal-body">
                <p>${message}</p>
            </div>
            <div class="modal-footer">
                <button class="btn ${buttonClass} modal-confirm">确定</button>
            </div>
        </div>
    `;
    
    // 添加到页面
    document.body.appendChild(modal);
    
    // 添加关闭事件
    const closeBtn = modal.querySelector('.modal-close');
    const confirmBtn = modal.querySelector('.modal-confirm');
    
    const closeModal = () => {
        document.body.removeChild(modal);
    };
    
    closeBtn.addEventListener('click', closeModal);
    confirmBtn.addEventListener('click', closeModal);
    
    // 点击模态框外部关闭
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
    
    // ESC键关闭
    const handleEsc = (e) => {
        if (e.key === 'Escape') {
            closeModal();
            document.removeEventListener('keydown', handleEsc);
        }
    };
    
    document.addEventListener('keydown', handleEsc);
}

// 删除城市访问记录
function deleteCityVisit() {
    showCustomConfirm('确认删除', '确定要删除这个城市的访问记录吗？', () => {
        // 用户确认删除的处理逻辑
        const currentUser = getCurrentUser();
        if (!currentUser) {
            showCustomModal('错误', '请先登录', 'error');
            return;
        }
        
        const deleteButton = document.getElementById('delete-city');
        const cityDbId = deleteButton.getAttribute('data-city-db-id');
        
        if (!cityDbId) {
            showCustomModal('错误', '未找到城市记录', 'error');
            return;
        }
        
        // 发送到服务器删除
        fetch(`/api/visited-cities/${cityDbId}?userId=${currentUser.id}`, {
            method: 'DELETE'
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('网络响应错误');
            }
            return response.json();
        })
        .then(data => {
            // 更新UI
            loadVisitedCities();
            
            // 关闭模态框
            document.getElementById('city-modal').style.display = 'none';
            
            showCustomModal('删除成功', '城市访问记录已成功删除！', 'success');
        })
        .catch(error => {
            console.error('删除城市访问数据失败:', error);
            showCustomModal('删除失败', '删除城市访问记录时发生错误，请重试。', 'error');
        });
    });
}

// 显示自定义确认对话框函数
function showCustomConfirm(title, message, onConfirm) {
    // 创建模态框元素
    const modal = document.createElement('div');
    modal.className = 'custom-modal-overlay';
    
    // 设置模态框内容
    modal.innerHTML = `
        <div class="custom-modal">
            <div class="modal-header">
                <span class="modal-icon warning">⚠</span>
                <h3>${title}</h3>
                <span class="modal-close">&times;</span>
            </div>
            <div class="modal-body">
                <p>${message}</p>
            </div>
            <div class="modal-footer">
                <button class="btn btn-warning modal-cancel" style="margin-right: 10px;">取消</button>
                <button class="btn btn-error modal-confirm">确定</button>
            </div>
        </div>
    `;
    
    // 添加到页面
    document.body.appendChild(modal);
    
    // 添加事件处理
    const closeBtn = modal.querySelector('.modal-close');
    const confirmBtn = modal.querySelector('.modal-confirm');
    const cancelBtn = modal.querySelector('.modal-cancel');
    
    const closeModal = () => {
        document.body.removeChild(modal);
    };
    
    // 确认按钮事件
    confirmBtn.addEventListener('click', () => {
        closeModal();
        if (onConfirm) onConfirm();
    });
    
    // 取消按钮和关闭按钮事件
    const closeHandler = () => {
        closeModal();
    };
    
    closeBtn.addEventListener('click', closeHandler);
    cancelBtn.addEventListener('click', closeHandler);
    
    // 点击模态框外部关闭
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeHandler();
        }
    });
    
    // ESC键关闭
    const handleEsc = (e) => {
        if (e.key === 'Escape') {
            closeHandler();
            document.removeEventListener('keydown', handleEsc);
        }
    };
    
    document.addEventListener('keydown', handleEsc);
}
