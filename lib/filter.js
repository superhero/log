import transform from '@superhero/log/transform'

/**
 * Different string filters
 */
export default
{
  camelCase         : s => String(s).replace(/[-_\s]+(.)?/g, (_, c) => c ? c.toUpperCase() : '').replace(/^[A-Z]/, m => m.toLowerCase()),
  capitalize        : s => String(s).toLowerCase().replace(/(^|[.!?]\s+)([a-z])/g, (_, prefix, char) => prefix + char.toUpperCase()),
  dashCase          : s => String(s).replace(/([a-z])([A-Z])/g, '$1-$2').replace(/\s+/g, '-').toLowerCase(),
  dotCase           : s => String(s).replace(/([a-z])([A-Z])/g, '$1.$2').replace(/\s+/g, '.').toLowerCase(),
  leet              : s => String(s).split('').map(c => transform.leet[c] || c).join(''),
  lowerCase         : s => String(s).toLowerCase(),
  pathCase          : s => String(s).replace(/([a-z])([A-Z])/g, '$1/$2').replace(/\s+/g, '/').toLowerCase(),
  pipeCase          : s => String(s).replace(/([a-z])([A-Z])/g, '$1|$2').replace(/\s+/g, '|').toLowerCase(),
  randomCase        : s => String(s).split('').map(c => Math.random() < 0.5 ? c.toLowerCase() : c.toUpperCase()).join(''),
  reverse           : s => String(s).split('').reverse().join(''),
  reverseSentences  : s => String(s).split('. ').reverse().join('. '),
  reverseWords      : s => String(s).split(' ').reverse().join(' '),
  snakeCase         : s => String(s).replace(/([a-z])([A-Z])/g, '$1_$2').replace(/\s+/g, '_').toLowerCase(),
  spaceCase         : s => String(s).replace(/([a-z])([A-Z])/g, '$1 $2').replace(/\s+/g, ' ').toLowerCase(),
  tildeCase         : s => String(s).replace(/([a-z])([A-Z])/g, '$1~$2').replace(/\s+/g, '~').toLowerCase(),
  titleCase         : s => String(s).replace(/\w\S*/g, w => w.charAt(0).toUpperCase() + w.substring(1).toLowerCase()),
  upperCase         : s => String(s).toUpperCase(),
}