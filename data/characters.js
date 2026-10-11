// {id, name, zh, years, faction, role, trait, events:[eventIds], chapters:'ช่วงตอนที่ปรากฏ'}
const CHARACTERS=[
{id:'liubei',name:'เล่าปี่',zh:'劉備',years:'161–223',faction:'shu',role:'ผู้ก่อตั้งจ๊กฮั่น',trait:'ใจกว้าง เป็นที่รักของคน ล้มแล้วลุกได้หลายครั้ง',events:['oath','xiapi','longzhong','changban','chibi','yizhou','dingjun','liubeiemp','yiling','baidi'],chapters:'1–85'},
{id:'guanyu',name:'กวนอู',zh:'關羽',years:'?–220',faction:'shu',role:'ขุนพลพี่รอง',trait:'ซื่อสัตย์ หยิ่งในเกียรติ ต่อมาได้รับการบูชาเป็นเทพเจ้า',events:['oath','hulao','fancheng','maicheng'],chapters:'1–77'},
{id:'zhangfei',name:'เตียวหุย',zh:'張飛',years:'?–221',faction:'shu',role:'ขุนพลน้องเล็ก',trait:'กล้าหาญ ใจร้อน เข้มงวดกับลูกน้อง',events:['oath','hulao','changban','yiling'],chapters:'1–81'},
{id:'zhuge',name:'ขงเบ้ง',zh:'諸葛亮',years:'181–234',faction:'shu',role:'อัครมหาเสนาบดีจ๊ก',trait:'วางแผนรอบคอบ ภักดีจนวาระสุดท้าย',events:['longzhong','chibi','liubeiemp','baidi','nanman','jieting','wuzhang'],chapters:'37–104'},
{id:'zhaoyun',name:'จูล่ง',zh:'趙雲',years:'?–229',faction:'shu',role:'ขุนพลองครักษ์',trait:'กล้าหาญและรอบคอบ',events:['changban'],chapters:'7–97'},
{id:'jiangwei',name:'เกียงอุย',zh:'姜維',years:'202–264',faction:'shu',role:'ผู้สืบทอดขงเบ้ง',trait:'บุกเหนือต่อหลายครั้ง',events:['shufall'],chapters:'93–119'},
{id:'caocao',name:'โจโฉ',zh:'曹操',years:'155–220',faction:'wei',role:'มหาอุปราช วุยอ๋อง',trait:'เด็ดขาด ใช้คนตามความสามารถ เป็นกวี',events:['hulao','xuchang','xiapi','guandu','changban','chibi'],chapters:'1–78'},
{id:'caopi',name:'โจผี',zh:'曹丕',years:'187–226',faction:'wei',role:'จักรพรรดิองค์แรกแห่งวุย',trait:'นักการเมืองและนักวรรณกรรม',events:['caopi'],chapters:'32–91'},
{id:'dengai',name:'เตงงาย',zh:'鄧艾',years:'197–264',faction:'wei',role:'แม่ทัพผู้พิชิตจ๊ก',trait:'ชำนาญภูมิศาสตร์ กล้าเดินทางลัด',events:['shufall'],chapters:'107–119'},
{id:'simayi',name:'สุมาอี้',zh:'司馬懿',years:'179–251',faction:'jin',role:'ต้นตระกูลจิ้น',trait:'อดทน รอจังหวะ',events:['wuzhang','gaoping'],chapters:'39–108'},
{id:'sunquan',name:'ซุนกวน',zh:'孫權',years:'182–252',faction:'wu',role:'จักรพรรดิแห่งง่อ',trait:'รู้จักใช้คน รักษาสมดุล',events:['suncequan','chibi','hefei','maicheng','sunquan'],chapters:'29–108'},
{id:'zhouyu',name:'จิวยี่',zh:'周瑜',years:'175–210',faction:'wu',role:'แม่ทัพใหญ่ง่อ',trait:'อัจฉริยะทางทหาร ชำนาญดนตรี (นิยายวาดให้ขี้อิจฉา)',events:['suncequan','chibi'],chapters:'15–57'},
{id:'lumeng',name:'ลิบอง',zh:'呂蒙',years:'178–220',faction:'wu',role:'แม่ทัพง่อ',trait:'ทหารที่หันมาเรียนหนังสือตอนโต',events:['maicheng'],chapters:'38–77'},
{id:'luxun',name:'ลกซุน',zh:'陸遜',years:'183–245',faction:'wu',role:'แม่ทัพและอัครเสนาบดีง่อ',trait:'อดทน ใช้ไฟและจังหวะเวลา',events:['maicheng','yiling'],chapters:'75–108'},
{id:'lubu',name:'ลิโป้',zh:'呂布',years:'?–198',faction:'other',role:'ขุนพลไร้เทียมทาน',trait:'เก่งรบแต่กลับกลอก',events:['hulao','lubu','xiapi'],chapters:'3–19'},
{id:'dongzhuo',name:'ตั๋งโต๊ะ',zh:'董卓',years:'?–192',faction:'other',role:'ทรราชผู้กุมราชสำนัก',trait:'โหดร้าย ทำลายลกเอี๋ยง',events:['dong','hulao','lubu'],chapters:'1–9'},
{id:'yuanshao',name:'อ้วนเสี้ยว',zh:'袁紹',years:'?–202',faction:'other',role:'ขุนศึกใหญ่แห่งภาคเหนือ',trait:'ตระกูลสูง แต่ลังเลไม่เด็ดขาด',events:['hulao','guandu'],chapters:'2–32'}
];
