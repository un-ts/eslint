import dictoraryEn from 'dictionary-en'
import retextEmoji from 'retext-emoji'
import retextEnglish from 'retext-english'
import retextSpell from 'retext-spell'

export default {
  plugins: [retextEnglish, retextEmoji, [retextSpell, dictoraryEn]],
}
