'use strict';
// Topics are ready; vocabulary will be added when requested.
const stageFourSections=[
  {id:'a4-office',name:'Office',ukTitle:'офіс',raw:''},
  {id:'a4-synonyms',name:'Synonyms',ukTitle:'синоніми',raw:''},
  {id:'a4-materials',name:'Materials and Fabrics',ukTitle:'матеріали та тканини',raw:''},
  {id:'a4-dreams',name:'Dreams and Wishes',ukTitle:'мрії та бажання',raw:''},
  {id:'a4-rules',name:'Rules and Prohibitions',ukTitle:'правила та заборони',raw:''},
  {id:'a4-geography',name:'Geography',ukTitle:'географія',raw:''},
  {id:'a4-environment',name:'Environment',ukTitle:'довкілля',raw:''},
  {id:'a4-rural-life',name:'Rural Life',ukTitle:'життя в селі',raw:''},
  {id:'a4-farm',name:'Farm and Garden',ukTitle:'ферма та сад',raw:''},
  {id:'a4-sea',name:'Sea and Beach',ukTitle:'море та пляж',raw:''},
  {id:'a4-mountains',name:'Mountains and Forests',ukTitle:'гори та ліси',raw:''},
  {id:'a4-space',name:'Space',ukTitle:'космос',raw:''},
  {id:'a4-sensations',name:'Feelings and Sensations',ukTitle:'почуття та відчуття',raw:''},
  {id:'a4-thoughts',name:'Thoughts and Beliefs',ukTitle:'думки та переконання',raw:''},
  {id:'a4-success',name:'Successes and Failures',ukTitle:'успіхи та невдачі',raw:''}
];
for(const [index,section] of stageFourSections.entries()){
  categories.push({id:section.id,name:section.name,en:section.name,ukTitle:section.ukTitle,stage:4,color:'olive',note:section.ukTitle,tile:['0% 0%','66.66% 14.28%','33.33% 0%','0% 42.85%'][index%4]});
  for(const line of section.raw.split('\n').filter(line=>line.trim())){
    const [en,uk]=line.split('|');
    words.push({id:section.id+'-'+encodeURIComponent(en.toLowerCase()),en,uk,category:section.id});
  }
}
