import { PrismaService } from '@/prisma/prisma.service'
import { Injectable } from '@nestjs/common'

@Injectable()
export class CommentService {
  constructor(private readonly prisma: PrismaService) {}
  // 发表评论
  async createComment(content: string, articleId: number, userId: number) {
    const data = await this.prisma.comment.create({
      data: {
        authorId: userId,
        content: content,
        postId: articleId,
      },
    })
    return { cod: 200, msg: '发表评论成功', data }
  }
  // 删除评论
  async deleteComment(userId: number, Commentid: number) {
    const data = await this.prisma.comment.findFirst({
      where: {
        id: Commentid,
      },
    })
    if (!data) {
      return { cod: 400, msg: '评论不存在' }
    }
    if (data.authorId !== userId) {
      return { cod: 400, msg: '无权删除评论' }
    }
    await this.prisma.comment.delete({
      where: {
        id: Commentid,
      },
    })
    return { cod: 200, msg: '删除评论成功', data }
  }
  async getComment(postId: number, page: number = 1, limit: number = 10) {
    const data = await this.prisma.comment.findMany({
      skip: (page - 1) * limit,
      take: limit,
      // 时间最新排序
      orderBy: {
        createdAt: 'desc',
      },
      where: {
        postId: postId,
      },
    })
    data.map((item) => {
      delete item.postId
      delete item.createdAt
      return item
    })
    //总页数
    const total = await this.prisma.comment.count({
      where: {
        postId: postId,
      },
    })
    //总条数
    const totalPage = Math.ceil(total / limit)
    return { cod: 200, msg: '获取评论成功', data, total, totalPage }
  }
  //修改评论
  async updateComment(userId: number, Commentid: number, content: string) {
    const data = await this.prisma.comment.findFirst({
      where: {
        id: Commentid,
      },
    })
    if (!data) {
      return { cod: 400, msg: '评论不存在' }
    }
    if (data.authorId !== userId) {
      return { cod: 400, msg: '无权修改评论' }
    }
    await this.prisma.comment.update({
      where: {
        id: Commentid,
      },
      data: {
        content: content,
      },
    })
    return { cod: 200, msg: '修改评论成功', data }
  }
}
