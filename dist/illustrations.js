'use strict';
// Exact English names plus Ukrainian meaning guards keep homographs distinct.
// c:picture:cell uses the user's existing artwork; s:code uses local Twemoji SVGs.
const vocabularyPictureRows=`
apple,apples|яблук|s:1f34e|Яблуко
banana,bananas|банан|s:1f34c|Банан
orange,oranges|апельсин|s:1f34a|Апельсин
pear,pears|груш|c:1:3|Груші
lemon,lemons|лимон|c:0:4|Лимони
grape,grapes|виноград|s:1f347|Виноград
peach,peaches|персик|s:1f351|Персик
plum,plums|слив|c:3:22|Сливи
cherry,cherries|вишн|черешн|c:0:7|Вишні
strawberry,strawberries|полуниц|c:0:0|Полуниці
blueberry,blueberries|лохин|чорниц|c:1:15|Ягоди лохини
blackberry,blackberries|ожин|c:2:7|Ожина
watermelon|кавун|s:1f349|Кавун
melon|дин|s:1f348|Диня
pineapple|ананас|s:1f34d|Ананас
kiwi,kiwifruit|ківі|s:1f95d|Ківі
coconut|кокос|s:1f965|Кокос
mango|манго|s:1f96d|Манго
pomegranate|гранат|c:2:0|Гранат
avocado|авокадо|s:1f951|Авокадо
potato,potatoes|картопл|s:1f954|Картопля
tomato,tomatoes|помідор|томат|s:1f345|Помідор
cucumber|огір|s:1f952|Огірок
carrot,carrots|моркв|s:1f955|Морква
onion|цибул|s:1f9c5|Цибуля
garlic|часник|s:1f9c4|Часник
lettuce|салат|s:1f96c|Листовий салат
bell pepper|перець|s:1fad1|Солодкий перець
corn|кукурудз|s:1f33d|Кукурудза
broccoli|броколі|s:1f966|Броколі
aubergine,eggplant|баклажан|s:1f346|Баклажан
mushroom,mushrooms|гриб|s:1f344|Гриби
bread|хліб|c:1:12|Хліб
butter|масло|s:1f9c8|Вершкове масло
cheese|сир|s:1f9c0|Сир
milk|молок|s:1f95b|Молоко
egg,eggs|яйц|s:1f95a|Яйце
meat|м'яс|м’яс|s:1f969|М’ясо
chicken|курятин|s:1f357|Курятина
chicken,hen|курк|s:1f414|Курка
rice|рис|s:1f35a|Рис
pasta,spaghetti|макарон|спагеті|s:1f35d|Спагеті
salt|сіль|s:1f9c2|Сіль
soup|суп|s:1f372|Суп
salad|салат|s:1f957|Овочевий салат
sandwich|бутерброд|сендвіч|s:1f96a|Сендвіч
jam|варенн|джем|c:0:11|Варення
honey|мед|s:1f36f|Мед
biscuit,cookie|печив|s:1f36a|Печиво
cake|торт|s:1f382|Торт
chocolate|шоколад|s:1f36b|Шоколад
pizza|піца|s:1f355|Піца
hamburger,burger|гамбургер|бургер|s:1f354|Гамбургер
chips,french fries|картопл|фрі|s:1f35f|Картопля фрі
ice cream|морозив|s:1f368|Морозиво
pie|пиріг|s:1f967|Пиріг
croissant|круасан|s:1f950|Круасан
pancake,pancakes|млин|s:1f95e|Млинці
water,mineral water,still water,sparkling water|вод|s:1f4a7|Вода
tea,black tea,a cup of tea|ча[йю]|c:1:21|Чашка чаю
green tea|ча[йю]|s:1f375|Зелений чай
coffee|кав|s:2615|Чашка кави
juice,orange juice,apple juice|сік|s:1f9c3|Сік
wine|вино|s:1f377|Вино
beer|пиво|s:1f37a|Пиво
bottle|пляш|s:1f37e|Пляшка
cup|чаш|c:1:21|Чашка
mug|горнят|чаш|c:3:7|Горнятко
glass|склян|s:1f95b|Склянка
plate|таріл|s:1f37d|Тарілка
bowl|миск|s:1f963|Миска
spoon,teaspoon,tablespoon|ложк|s:1f944|Ложка
knife|ніж|s:1f52a|Ніж
fork|видел|s:1f374|Виделка та ніж
frying pan|сковор|s:1f373|Сковорода
scales|ваг|s:2696|Терези
chair|стілец|стільц|s:1fa91|Стілець
sofa,couch|диван|s:1f6cb|Диван
bed|ліжк|s:1f6cf|Ліжко
door|двер|s:1f6aa|Двері
window|вікн|c:2:8|Вікно
mirror|дзеркал|c:2:6|Дзеркало
light bulb,bulb|лампоч|s:1f4a1|Лампочка
candle|свічк|s:1f56f|Свічка
clock|годинник|s:1f570|Настільний годинник
pocket watch|кишеньков|c:3:18|Кишеньковий годинник
watch|годинник|s:231a|Наручний годинник
key|^ключ([ ;,(]|$)|c:0:13|Ключ
lock|замок|s:1f512|Замок
basket|кошик|c:0:3|Кошик
laundry basket|кошик|s:1f9fa|Кошик для білизни
storage box,box|короб|s:1f4e6|Коробка
bin,dustbin|сміт|s:1f5d1|Відро для сміття
broom|мітл|s:1f9f9|Мітла
bucket|відр|s:1faa3|Відро
soap|мил[оа]|s:1f9fc|Мило
sponge|губк|s:1f9fd|Губка
toilet paper|туалетн|s:1f9fb|Туалетний папір
toilet|туалет|s:1f6bd|Туалет
bath,bathtub|ванн|s:1f6c1|Ванна
shower|душ|s:1f6bf|Душ
toothbrush|зубн|s:1faa5|Зубна щітка
razor|бритв|s:1fa92|Бритва
scissors|ножиц|s:2702|Ножиці
battery|батаре|акумулят|s:1f50b|Батарейка
plug|вилк|s:1f50c|Електрична вилка
television,tv|телевізор|s:1f4fa|Телевізор
radio|радіо|s:1f4fb|Радіо
computer,desktop computer|комп'ютер|комп’ютер|s:1f5a5|Комп’ютер
laptop|ноутбук|s:1f4bb|Ноутбук
keyboard|клавіатур|s:2328|Клавіатура
mouse|комп'ютер|комп’ютер|s:1f5b1|Комп’ютерна миша
printer|принтер|s:1f5a8|Принтер
phone,mobile phone,smartphone|телефон|смартфон|s:1f4f1|Телефон
camera|камер|фотоапарат|s:1f4f7|Фотоапарат
headphones|навушник|s:1f3a7|Навушники
microphone|мікрофон|s:1f3a4|Мікрофон
book,books|книж|книг|c:3:13|Книжки
notebook|зошит|блокнот|s:1f4d3|Зошит
pen|ручк|s:1f58a|Ручка
pencil|олівець|s:270f|Олівець
ruler|лінійк|s:1f4cf|Лінійка
paperclip|скріпк|s:1f4ce|Скріпка
envelope|конверт|c:1:10|Конверт
letter|лист|s:2709|Лист
newspaper|газет|s:1f4f0|Газета
map|карт|s:1f5fa|Мапа
calendar|календар|s:1f4c5|Календар
bag,handbag|сумк|s:1f45c|Сумка
backpack,rucksack|рюкзак|s:1f392|Рюкзак
suitcase,luggage|валіз|багаж|s:1f9f3|Валіза
t-shirt|футболк|s:1f455|Футболка
jeans,trousers|джинс|штан|s:1f456|Штани
coat|пальт|s:1f9e5|Пальто
dress|сукн|s:1f457|Сукня
socks|шкарпет|s:1f9e6|Шкарпетки
hat|капелюх|s:1f452|Капелюх
cap|кепк|s:1f9e2|Кепка
scarf|шарф|s:1f9e3|Шарф
gloves|рукавич|s:1f9e4|Рукавички
shoe,shoes|черевик|взутт|туфл|s:1f45e|Черевик
trainers,sneakers|кросів|s:1f45f|Кросівки
boots,rubber boots,wellington boots|чоб|s:1f97e|Чобіт
high heels|підбор|s:1f460|Туфля на підборах
sandals|сандал|босоніж|s:1f461|Босоніжка
glasses,spectacles|окуляр|s:1f453|Окуляри
sunglasses|окуляр|s:1f576|Сонцезахисні окуляри
umbrella|парасол|s:2602|Парасоля
ring|каблуч|перст|s:1f48d|Каблучка
diamond|діамант|алмаз|s:1f48e|Діамант
car|автомобіл|машин|s:1f697|Автомобіль
bus|автобус|s:1f68c|Автобус
train|поїзд|потяг|s:1f686|Поїзд
tram|трамва|s:1f68b|Трамвай
underground,subway,metro|метро|s:1f687|Метро
taxi|таксі|s:1f695|Таксі
bicycle,bike|велосипед|s:1f6b2|Велосипед
motorbike,motorcycle|мотоцикл|s:1f3cd|Мотоцикл
plane,airplane,aeroplane|літак|s:2708|Літак
boat|човен|s:1f6a3|Човен
ship|кораб|судно|s:1f6a2|Корабель
truck,lorry|вантажів|s:1f69a|Вантажівка
ambulance|швидк|s:1f691|Швидка допомога
fire engine|пожежн|s:1f692|Пожежна машина
helicopter|вертоліт|гелікоптер|s:1f681|Гелікоптер
rocket|ракет|s:1f680|Ракета
traffic light,traffic lights|світлофор|s:1f6a6|Світлофор
ticket,return ticket,single ticket|квиток|s:1f3ab|Квиток
house,home,cottage|будинок|будин|дім|хат|c:0:6|Будинок
school|школ|s:1f3eb|Школа
hospital|лікарн|s:1f3e5|Лікарня
hotel|готел|s:1f3e8|Готель
bank|банк|s:1f3e6|Банк
church|церкв|s:26ea|Церква
castle|замок|фортец|s:1f3f0|Замок
bridge|міст|s:1f309|Міст
tent|намет|s:26fa|Намет
fountain|фонтан|s:26f2|Фонтан
dog,puppy|собак|цуцен|пес|s:1f415|Собака
cat,kitten|кіт|кішк|кот|кошен|s:1f408|Кіт
bird|птах|c:0:10|Птах
fish|риб|s:1f41f|Риба
horse|кінь|кон|s:1f40e|Кінь
cow|коров|s:1f404|Корова
pig|свин|s:1f416|Свиня
sheep|вівц|s:1f411|Вівця
goat|коз|s:1f410|Коза
duck|качк|s:1f986|Качка
goose|гус|c:1:0|Гуска
swan|лебід|c:3:0|Лебідь
rabbit|крол|s:1f407|Кролик
hare|заєць|зайц|c:2:19|Заєць
deer|олень|олен|c:1:11|Олень
mouse|миш|s:1f401|Миша
rat|щур|s:1f400|Щур
fox|лисиц|s:1f98a|Лисиця
wolf|вовк|s:1f43a|Вовк
bear|ведмід|s:1f43b|Ведмідь
lion|лев|s:1f981|Лев
tiger|тигр|s:1f405|Тигр
elephant|слон|s:1f418|Слон
monkey|мавп|s:1f412|Мавпа
giraffe|жираф|s:1f992|Жирафа
zebra|зебр|s:1f993|Зебра
snake|змія|змії|s:1f40d|Змія
frog|жаб|s:1f438|Жаба
turtle,tortoise|черепах|s:1f422|Черепаха
crocodile|крокодил|s:1f40a|Крокодил
whale|кит|s:1f40b|Кит
dolphin|дельфін|s:1f42c|Дельфін
shark|акул|s:1f988|Акула
octopus|восьмин|s:1f419|Восьминіг
crab|краб|s:1f980|Краб
lobster|омар|лобстер|s:1f99e|Омар
shrimp,prawn|кревет|s:1f990|Креветка
owl|сова|s:1f989|Сова
eagle|орел|s:1f985|Орел
parrot|папуг|s:1f99c|Папуга
penguin|пінгвін|s:1f427|Пінгвін
dove,pigeon|голуб|горлиц|s:1f54a|Голуб
bat|кажан|s:1f987|Кажан
feather|перо|пір|s:1fab6|Перо
butterfly|метелик|s:1f98b|Метелик
moth|метелик|міль|c:2:3|Нічний метелик
bee,bumblebee|бджол|джміл|s:1f41d|Бджола
ant|мурах|s:1f41c|Мураха
ladybird,ladybug|сонечко|s:1f41e|Сонечко
beetle|жук|s:1fab2|Жук
fly|муха|s:1fab0|Муха
mosquito|комар|s:1f99f|Комар
dragonfly|бабк|c:3:14|Бабка
cricket|цвіркун|s:1f997|Цвіркун
cockroach|тарган|s:1fab3|Тарган
spider|павук|s:1f577|Павук
snail|равлик|c:1:17|Равлик
worm|черв|s:1fab1|Черв’як
flower,flowers|квіт|c:3:17|Квіти
bouquet|букет|c:2:10|Букет
rose|троянд|s:1f339|Троянда
tulip|тюльпан|s:1f337|Тюльпан
daisy|стокрот|маргарит|c:3:17|Маргаритки
sunflower|соняшник|s:1f33b|Соняшник
lavender|лаванд|c:3:11|Лаванда
snowdrop|підсніж|c:3:3|Підсніжники
lily of the valley|конвалі|c:0:2|Конвалії
plant|рослин|s:1fab4|Рослина
flowerpot|горщик|s:1fab4|Квітковий горщик
tree|дерев|s:1f333|Дерево
pine|сосн|s:1f332|Сосна
leaf|листок|листя|s:1f343|Листок
maple|клен|s:1f341|Кленовий листок
branch|гілк|c:0:20|Гілка
acorn|жолуд|c:3:19|Жолуді
seedling|парост|саджан|s:1f331|Паросток
watering can|лійк|c:1:14|Лійка
sun|сонц|s:2600|Сонце
moon|місяць|s:1f319|Місяць
star|зірк|s:2b50|Зірка
cloud|хмар|s:2601|Хмара
rain|дощ|c:3:10|Дощ
snow,snowflake|сніг|сніжин|s:2744|Сніжинка
snowman|сніговик|s:26c4|Сніговик
rainbow|веселк|райдуг|s:1f308|Веселка
lightning|блискавк|s:26a1|Блискавка
fire|вогонь|s:1f525|Вогонь
mountain|гор[аи]|s:26f0|Гора
volcano|вулкан|s:1f30b|Вулкан
island|острів|s:1f3dd|Острів
beach|пляж|s:1f3d6|Пляж
desert|пустел|s:1f3dc|Пустеля
wave|хвил|s:1f30a|Хвиля
earth,world,globe|земл|світ|глобус|s:1f30d|Земна куля
shell,seashell|мушл|s:1f41a|Мушля
stone,rock|камін|кам'|кам’|s:1faa8|Камінь
wood|деревин|s:1fab5|Деревина
brick|цегл|s:1f9f1|Цегла
magnet|магніт|s:1f9f2|Магніт
ladder|драбин|s:1fa9c|Драбина
hammer|молот|s:1f528|Молоток
screwdriver|викрутк|s:1fa9b|Викрутка
saw|пилк|s:1fa9a|Пилка
wrench,spanner|ключ|s:1f527|Гайковий ключ
nut and bolt|гайк|болт|s:1f529|Гайка й болт
axe|сокир|s:1fa93|Сокира
anchor|якір|s:2693|Якір
football,soccer ball|футбол|м'яч|м’яч|s:26bd|Футбольний м’яч
basketball|баскетбол|s:1f3c0|Баскетбольний м’яч
tennis|теніс|s:1f3be|Тенісна ракетка й м’яч
volleyball|волейбол|s:1f3d0|Волейбольний м’яч
guitar|гітар|s:1f3b8|Гітара
violin|скрипк|s:1f3bb|Скрипка
drum|барабан|s:1f941|Барабан
trumpet|труб|s:1f3ba|Труба
saxophone|саксофон|s:1f3b7|Саксофон
chess|шах|s:265f|Шахова фігура
chess pawn|пішак|s:265f|Пішак
dice|кубик|s:1f3b2|Гральний кубик
puzzle|пазл|головолом|s:1f9e9|Пазл
gift,present|подарун|s:1f381|Подарунок
balloon|кульк|s:1f388|Повітряна кулька
flag|прапор|s:1f6a9|Прапор
heart|серц|s:2764|Серце
brain|мозок|s:1f9e0|Мозок
eye|око|s:1f441|Око
ear|вухо|s:1f442|Вухо
nose|ніс|s:1f443|Ніс
mouth|рот|s:1f444|Рот
tooth,teeth|зуб|s:1f9b7|Зуб
tongue|язик|s:1f445|Язик
hand|рук|кист|s:270b|Кисть руки
leg|ног|s:1f9b5|Нога
foot,feet|стоп|s:1f9b6|Стопа
bone|кістк|s:1f9b4|Кістка
lungs|леген|s:1fac1|Легені
pill,tablet|таблет|пігул|s:1f48a|Пігулка
thermometer|термометр|s:1f321|Термометр
syringe|шприц|s:1f489|Шприц
stethoscope|стетоскоп|s:1fa7a|Стетоскоп
red|червон|s:1f7e5|Червоний колір
orange|помаранч|s:1f7e7|Помаранчевий колір
yellow|жовт|s:1f7e8|Жовтий колір
green|зелен|s:1f7e9|Зелений колір
blue|син|блакит|s:1f7e6|Синій колір
purple|фіолет|s:1f7ea|Фіолетовий колір
brown|коричн|s:1f7eb|Коричневий колір
black|чорн|s:2b1b|Чорний колір
white|біл|s:2b1c|Білий колір
`.trim().split('\n');

const vocabularyPictures=new Map();
for(const row of vocabularyPictureRows){
  const fields=row.split('|'),names=fields.shift().split(','),alt=fields.pop(),source=fields.pop(),meaning=new RegExp(fields.join('|'),'iu');
  const [type,first,second]=source.split(':');
  const picture=type==='c'?{type:'cottage',picture:Number(first),cell:Number(second),alt}:{type:'svg',src:`images/vocabulary/${first}.svg`,alt};
  for(const name of names){const key=name.toLowerCase();if(!vocabularyPictures.has(key))vocabularyPictures.set(key,[]);vocabularyPictures.get(key).push({meaning,picture});}
}
function lessonIllustrations(word){
  const names=String(word.en).normalize('NFKC').toLowerCase().trim().split(/\s*\/\s*/);
  if(names.length>2)return [];
  const pictures=names.map(name=>vocabularyPictures.get(name)?.find(item=>item.meaning.test(String(word.uk)))?.picture);
  if(pictures.some(picture=>!picture))return [];
  return pictures.filter((picture,index)=>pictures.findIndex(other=>other.type===picture.type&&other.src===picture.src&&other.picture===picture.picture&&other.cell===picture.cell)===index);
}
