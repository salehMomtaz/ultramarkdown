import { api } from 'sdk';
import { JSDOM } from 'jsdom';
import { Readability } from '@mozilla/readability';
import { isAuthorized } from 'lib/whitelist';

export default async function (message) {
  const userId = message.from.id;

  if (!await isAuthorized(userId)) {
    await api.sendMessage({
      chat_id: message.chat.id,
      text: "You are not authorized to use this bot. Please contact the administrator."
    });
    return;
  }

  const url = message.text;

  if (!url || !url.match(/^https?:\/\//i)) {
    await api.sendMessage({
      chat_id: message.chat.id,
      text: "Please send a valid URL to convert to Markdown."
    });
    return;
  }

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const html = await response.text();
    const dom = new JSDOM(html);
    const reader = new Readability(dom.window.document);
    const article = reader.parse();

    let markdown = '';
    if (article) {
      markdown = `# ${article.title}\n\n${article.textContent}`;
      markdown = markdown.replace(/<h1>(.*?)<\/h1>/g, '# $1\n\n');
      markdown = markdown.replace(/<h2>(.*?)<\/h2>/g, '## $1\n\n');
      markdown = markdown.replace(/<h3>(.*?)<\/h3>/g, '### $1\n\n');
      markdown = markdown.replace(/<p>(.*?)<\/p>/g, '$1\n\n');
      markdown = markdown.replace(/<strong>(.*?)<\/strong>/g, '**$1**');
      markdown = markdown.replace(/<em>(.*?)<\/em>/g, '*$1*');
      markdown = markdown.replace(/<a href="(.*?)">(.*?)<\/a>/g, '[$2]($1)');
      markdown = markdown.replace(/<ul>/g, '');
      markdown = markdown.replace(/<\/ul>/g, '\n');
      markdown = markdown.replace(/<li>(.*?)<\/li>/g, '- $1\n');
    } else {
      markdown = `Could not extract main content from ${url}. Here's the raw content:\n\n${html.substring(0, 2000)}...`;
    }

    await api.sendMessage({
      chat_id: message.chat.id,
      text: markdown,
      parse_mode: 'Markdown'
    });

  } catch (error) {
    await api.sendMessage({
      chat_id: message.chat.id,
      text: `Sorry, could not fetch and convert that URL: ${error.message}`
    });
  }
}
