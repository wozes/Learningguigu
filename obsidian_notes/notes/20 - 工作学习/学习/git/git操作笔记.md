# Git 操作笔记

## 基础配置

### 初始配置

```bash
# 设置用户名和邮箱
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# 查看配置
git config --list

# 设置默认编辑器
git config --global core.editor vim
```

### 初始化仓库

```bash
# 在当前目录初始化Git仓库
git init

# 克隆远程仓库
git clone https://github.com/username/repository.git
```

## 基本工作流程

### 文件状态管理

```bash
# 查看文件状态
git status

# 查看简洁状态信息
git status -s

# 添加文件到暂存区
git add filename.txt          # 添加单个文件
git add .                     # 添加所有文件
git add *.js                  # 添加特定类型文件

# 从暂存区移除文件
git reset filename.txt

# 取消对文件的修改
git checkout -- filename.txt
```

### 提交更改

```bash
# 提交暂存区的文件
git commit -m "提交信息"

# 添加并提交（跳过暂存区）
git commit -am "提交信息"

# 修改最后一次提交
git commit --amend -m "新的提交信息"
```

## 分支管理

### 分支操作

```bash
# 查看所有分支
git branch

# 查看远程分支
git branch -r

# 查看所有分支（本地和远程）
git branch -a

# 创建新分支
git branch new-feature

# 切换分支
git checkout new-feature

# 创建并切换到新分支
git checkout -b new-feature

# 使用新语法创建并切换分支
git switch -c new-feature

# 删除分支
git branch -d branch-name

# 强制删除分支
git branch -D branch-name
```

### 分支合并

```bash
# 合并分支到当前分支
git merge feature-branch

# 创建合并提交（即使可以快进）
git merge --no-ff feature-branch

# 变基合并
git rebase main
```

## 远程仓库操作

### 远程仓库管理

```bash
# 查看远程仓库
git remote -v

# 添加远程仓库
git remote add origin https://github.com/username/repository.git

# 修改远程仓库地址
git remote set-url origin https://github.com/username/new-repository.git

# 删除远程仓库
git remote remove origin
```

### 推送和拉取

```bash
# 推送到远程仓库
git push origin main

# 首次推送并设置上游分支
git push -u origin main

# 推送所有分支
git push origin --all

# 拉取远程更改
git pull origin main

# 获取远程更改（不合并）
git fetch origin

# 强制推送（谨慎使用）
git push --force origin main
```

## 查看历史记录

### 提交历史

```bash
# 查看提交历史
git log

# 查看简洁的提交历史
git log --oneline

# 查看图形化分支历史
git log --graph --oneline --all

# 查看特定文件的历史
git log filename.txt

# 查看最近n个提交
git log -n 5
```

### 查看更改

```bash
# 查看工作区和暂存区的差异
git diff

# 查看暂存区和最后提交的差异
git diff --cached

# 查看两个提交之间的差异
git diff commit1 commit2

# 查看特定文件的差异
git diff filename.txt
```

## 撤销和重置

### 撤销操作

```bash
# 撤销工作区的修改
git checkout -- filename.txt

# 撤销暂存区的文件
git reset HEAD filename.txt

# 撤销最后一次提交（保留更改）
git reset --soft HEAD~1

# 撤销最后一次提交（丢弃更改）
git reset --hard HEAD~1

# 创建新提交来撤销指定提交
git revert commit-hash
```

### 重置操作

```bash
# 软重置（保留工作区和暂存区）
git reset --soft HEAD~1

# 混合重置（保留工作区，清空暂存区）
git reset --mixed HEAD~1

# 硬重置（清空工作区和暂存区）
git reset --hard HEAD~1
```

## 标签管理

### 创建和管理标签

```bash
# 创建轻量标签
git tag v1.0.0

# 创建附注标签
git tag -a v1.0.0 -m "版本 1.0.0"

# 查看所有标签
git tag

# 查看标签信息
git show v1.0.0

# 推送标签到远程
git push origin v1.0.0

# 推送所有标签
git push origin --tags

# 删除本地标签
git tag -d v1.0.0

# 删除远程标签
git push origin --delete tag v1.0.0
```

## 暂存操作

### 使用stash

```bash
# 暂存当前工作区
git stash

# 暂存并添加描述
git stash save "work in progress"

# 查看暂存列表
git stash list

# 应用最近的暂存
git stash apply

# 应用并删除最近的暂存
git stash pop

# 应用指定的暂存
git stash apply stash@{0}

# 删除暂存
git stash drop stash@{0}

# 清空所有暂存
git stash clear
```

## 文件管理

### 忽略文件

```bash
# 创建.gitignore文件
touch .gitignore

# .gitignore常用规则示例：
# *.log          # 忽略所有.log文件
# node_modules/  # 忽略node_modules目录
# .env           # 忽略环境变量文件
# build/         # 忽略build目录
```

### 文件追踪

```bash
# 停止追踪文件但保留在工作区
git rm --cached filename.txt

# 删除文件并停止追踪
git rm filename.txt

# 重命名文件
git mv old-name.txt new-name.txt
```

## 高级操作

### 交互式变基

```bash
# 交互式变基最近3个提交
git rebase -i HEAD~3

# 在交互式编辑器中可以：
# pick：保留提交
# reword：修改提交信息
# edit：编辑提交
# squash：合并到上一个提交
# drop：删除提交
```

### 查找和定位

```bash
# 在提交历史中搜索
git log --grep="关键词"

# 在代码中搜索
git grep "function"

# 使用二分查找定位bug
git bisect start
git bisect bad HEAD
git bisect good v1.0.0
```

## 常用别名配置

```bash
# 设置常用别名
git config --global alias.st status
git config --global alias.co checkout
git config --global alias.br branch
git config --global alias.ci commit
git config --global alias.unstage 'reset HEAD --'
git config --global alias.last 'log -1 HEAD'
git config --global alias.visual '!gitk'
```

## 实用技巧

### 提交信息规范

```
feat: 新功能
fix: 修复bug
docs: 文档更新
style: 代码格式化
refactor: 重构代码
test: 测试相关
chore: 构建过程或辅助工具的变动
```

### 常见问题解决

```bash
# 合并时出现冲突
git status                    # 查看冲突文件
# 手动解决冲突后
git add .
git commit

# 忘记切换分支就开始工作
git stash                     # 暂存当前工作
git checkout correct-branch   # 切换到正确分支
git stash pop                 # 恢复工作

# 查看某个文件的修改作者
git blame filename.txt

# 查看某行代码的修改历史
git log -p -S "code line"
```

## 最佳实践

1. **提交频率**：经常提交，保持提交的原子性
2. **分支策略**：使用feature分支进行功能开发
3. **提交信息**：写清楚、有意义的提交信息
4. **代码审查**：使用Pull Request进行代码审查
5. **备份重要分支**：定期推送到远程仓库
6. **使用标签**：为重要版本打标签
7. **保持整洁**：定期清理无用的分支和标签