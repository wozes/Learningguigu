---
target: tasks
status: 全力冲刺
tags: project/open
color: "#5cedeb"
---

## 主线任务
**2025年07月27日 19:00**
- [x] 🛫 离职跑路
- [ ] 

## 支线任务
- [x] 🛫 离职

## 会议记录

### 首月冲刺会议

- [x] 首月冲刺计划会议 ⏳ 2023-05-30 

==人员动员和激励==

==计划讨论内容==

==计划输出结果==

==输出结果==

## 工作记录



```dataviewjs
// 1. 定义文件夹路径和开始结束字符串
let diaryFolderPath = "00 - 每日日记";
let startStr = "**素食店**"; 
// 定义一个正则表达式，匹配以 '**xxx**' 或 '# XX' 开头的行
let endPattern = /^(#+ .+|\*\*.+\*\*)/; 

// 2. 获取包含 diaryFolderPath 的所有 markdown 文件
const diaryFiles = app.vault.getMarkdownFiles().filter(file => file.path.includes(diaryFolderPath));

// 3. 遍历所有日记文件，对每个文件内容进行处理
let diaryContentPromises = diaryFiles.map(file => {
  // 使用异步操作读取文件内容
  return app.vault.cachedRead(file).then(content => {
    // 分割内容为单独的行
    let lines = content.split("\n");
    let summary = "";
    let capture = false;

    // 4. 遍历所有行
    lines.forEach(line => {
      if (line.startsWith(startStr)) {
        // 如果行以 startStr 开头，则开始捕获
        capture = true;
      } else if (endPattern.test(line)) { 
        // 如果行满足 endPattern，那么结束捕获
        capture = false;
      } else if (capture && !line.startsWith(startStr)) { 
        // 如果处于捕获状态且行不以 startStr 开头，则将行添加到 summary
        summary += line + "\n";
      }
    });

    // 5. 清除 summary 的前后空白
    summary = summary.trim();
    let date = file.basename;

    // 6. 使用 moment.js 格式化日期，将 'YYYY年MM月DD日' 转换为 'M月D日'
    date = moment(date, 'YYYY年MM月DD日').format('M月D日');

    // 7. 如果找到了总结，返回日期和总结
    if (summary) {
      return [date, summary];
    }
  });
});

// 8. 等待所有文件内容处理完成
Promise.all(diaryContentPromises).then(diaryContents => {
  // 过滤出定义了总结的文件内容
  const validContents = diaryContents.filter(content => content !== undefined);
  // 在 Dataview 表格中显示结果
  dv.table(["日期", "总结"], validContents);
});

```


