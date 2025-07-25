---
author: Lee Yunjin
---

# [Javascript] Use proper Regular Expressions

# Problem
My blog didn’t handle URL encoding properly when adding an auto link for an attached photo. This caused a problem when the file name contained spaces—since in URLs, spaces must be encoded as `%20`. The backend correctly served the file using `%20`, but my blog inserted the file path as-is, causing broken links.

Initially, I tried using JavaScript’s `replace()` method like this:

```javascript
result.url.replace(" ", "%20")
```

However, this only replaced the first space, and left others untouched.

To replace **all spaces** in the string, I had to use a Regular Expression, just like we often do with `sed` in Unix:

```javascript
setContent((prevContent) => prevContent + `\n![Alt text for image](${result.url.replace(/\s/g, "%20")})\n`);
```

This properly encodes all spaces in the URL.

For example, here’s a single-panel cartoon I uploaded:

![Alt text for image](https://hobbies.yoonjin2.kr:8080/assets/free%20additional%20features.jpg)

The URL is `https:/hobbies.yoonjin2.kr:8080/assets/free%20%additional%20features.jpg`.
For visually impaired users, here’s the text content:

---

**AN UPDATE IS AVAILABLE FOR YOUR COMPUTER**

- **Linux user**: COOL, MORE FREE STUFF!  
- **Windows user**: NOT AGAIN!  
- **macOS user**: OOH, ONLY $99!

---

This little fix ensures that images with space-containing filenames load correctly on my blog.
