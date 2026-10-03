const text = {type:'string',maxLength:6000};
const list = {type:'array',items:text,maxItems:12};
const object = (properties) => ({type:'object',properties,required:Object.keys(properties),additionalProperties:false});
const verdict = object({status:{type:'string',enum:['Clear','Needs validation','Needs simplification']},explanation:text});
export const reportSchema = object({
 idea:object({working_name:text,one_line_concept:text}),
 human:object({primary_user:text,situation:text,friction:text,desired_outcome:text}),
 useful:object({smallest_useful_version:text,core_capabilities:{...list,minItems:3,maxItems:6},defer:list}),
 technology:object({recommended_format:text,required:list,unnecessary:list,why:text}),
 ai:object({recommendation:text,useful_for:list,avoid_for:list,risks:list}),
 complexity:object({concerns:list}),
 reality:object({assumptions:list,biggest_unknown:text,validation_needed:list}),
 hn_test:object({real_problem:verdict,focused_version:verdict,technology_fit:verdict,human_value:verdict,simplification:verdict}),
 next_move:object({recommendation:text,reasoning:text,actions:{...list,minItems:3,maxItems:3}}),
 confidence:object({known_from_user:list,inferred:list,unknown:list})
});
export const questionsSchema = object({questions:{type:'array',maxItems:3,items:object({id:{type:'string',enum:['primaryUser','desiredOutcome','currentWorkaround']},label:{type:'string',maxLength:200},hint:{type:'string',maxLength:300},placeholder:{type:'string',maxLength:200}})}});
export function validateShape(value,schema) {
 if(schema.type==='object') {
  if(!value || typeof value!=='object' || Array.isArray(value) || Object.keys(value).some(k=>!Object.hasOwn(schema.properties,k))) throw Error('Invalid response');
  for(const key of schema.required) validateShape(value[key],schema.properties[key]);
 } else if(schema.type==='array') {
  if(!Array.isArray(value)||value.length>(schema.maxItems??Infinity)||value.length<(schema.minItems??0)) throw Error('Invalid response');
  value.forEach(v=>validateShape(v,schema.items));
 } else if(typeof value!=='string'||value.length>(schema.maxLength??Infinity)||(schema.enum&&!schema.enum.includes(value))) throw Error('Invalid response');
 return value;
}
export function validateQuestions(value) {
 validateShape(value,questionsSchema);
 if(new Set(value.questions.map(q=>q.id)).size!==value.questions.length) throw Error('Invalid response');
 return value.questions;
}
