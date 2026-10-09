import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import type { ObjectId } from 'mongoose';
import { GraphQLUpload, FileUpload } from 'graphql-upload';
import { MemberService } from './member.service';
import {
  InstructorsInquiry,
  LoginInput,
  MemberInput,
  MembersInquiry,
} from '../../libs/dto/member/member.input';
import { Member, Members } from '../../libs/dto/member/member';
import { AuthGuard } from '../auth/guards/auth.guard';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { MemberType } from '../../libs/enums/member.enum';
import { RolesGuard } from '../auth/guards/roles.guard';
import { MemberUpdate } from '../../libs/dto/member/member.update';
import { shapeIntoMongoObjectId } from '../../libs/config';
import { WithoutGuard } from '../auth/guards/without.guard';
import {
  assertGenericUploadTarget,
  saveImageUpload,
} from '../../libs/image-upload';
import { InstructorProfileUpdate } from '../../libs/dto/member/instructor-profile.update';

@Resolver()
export class MemberResolver {
  constructor(private readonly memberService: MemberService) {}

  @Mutation(() => Member)
  public async signup(@Args('input') input: MemberInput): Promise<Member> {
    console.log('INPUT:::', input);
    return await this.memberService.signup(input);
  }

  @Mutation(() => Member)
  public async login(@Args('input') input: LoginInput): Promise<Member> {
    console.log('MUTTATION LOGININPUT:::', input);
    return await this.memberService.login(input);
  }

  @UseGuards(AuthGuard)
  @Query(() => String)
  public async chechAuth(
    @AuthMember('memberNick') memberNick: string,
  ): Promise<String> {
    console.log('DATA', memberNick);
    return await `hi ${memberNick}`;
  }

  @Roles(MemberType.INSTRUCTOR, MemberType.USER)
  @UseGuards(RolesGuard)
  @UseGuards(AuthGuard)
  @Query(() => String)
  public async chechAuthRoles(
    @AuthMember() authMember: Member,
  ): Promise<String> {
    return await `hi ${authMember.memberNick}, you are ${authMember.memberType}, your id is ${authMember._id}`;
  }

  @UseGuards(AuthGuard)
  @Mutation(() => Member)
  public async updateMember(
    @Args('input') input: MemberUpdate,
    @AuthMember('_id') memberId: ObjectId,
  ): Promise<Member> {
    console.log('updateMember');
    delete input._id;
    return await this.memberService.updateMember(memberId, input);
  }

  @UseGuards(WithoutGuard)
  @Query(() => Member)
  public async getMember(
    @Args('memberId') input: string,
    @AuthMember('_id') memberId: ObjectId,
  ): Promise<Member> {
    console.log('getMember');
    console.log(memberId);
    const targetId = shapeIntoMongoObjectId(input);
    return await this.memberService.getMember(memberId, targetId);
  }

  @UseGuards(WithoutGuard)
  @Query(() => Members)
  public async getInstructors(
    @Args('input') input: InstructorsInquiry,
    @AuthMember('_id') memberId: ObjectId,
  ): Promise<Members> {
    console.log('getInstructors');
    return await this.memberService.getInstructors(memberId, input);
  }

  @UseGuards(AuthGuard)
  @Mutation(() => Member)
  public async likeTargetMember(
    @Args('memberId') input: string,
    @AuthMember('_id') memberId: ObjectId,
  ): Promise<Member> {
    console.log('Mutation, likeTargetMember');
    const likeRefId = shapeIntoMongoObjectId(input);
    return await this.memberService.likeTargetMember(memberId, likeRefId);
  }

  @Roles(MemberType.INSTRUCTOR)
  @UseGuards(RolesGuard)
  @Mutation(() => Member)
  public async updateInstructorProfile(
    @Args('input') input: InstructorProfileUpdate,
    @AuthMember('_id') memberId: ObjectId,
  ): Promise<Member> {
    return await this.memberService.updateInstructorProfile(memberId, input);
  }

  /**ADMIN */

  //AUTHORIZATION
  @Roles(MemberType.ADMIN)
  @UseGuards(RolesGuard)
  @Query(() => Members)
  public async getAllMembersByAdmin(
    @Args('input') input: MembersInquiry,
  ): Promise<Members> {
    console.log('getAllMembersByAdmin');
    return await this.memberService.getAllMembersByAdmin(input);
  }

  //AUTHORIZATION
  @Roles(MemberType.ADMIN)
  @UseGuards(RolesGuard)
  @Mutation(() => Member)
  public async updateMemberByAdmin(
    @Args('input') input: MemberUpdate,
  ): Promise<Member> {
    console.log('updateMemberByAdmigetAllMembersByAdmin');
    return await this.memberService.updateMemberByAdmin(input);
  }

  //**IMage UPLOADER */

  @UseGuards(AuthGuard)
  @Mutation((returns) => String)
  public async imageUploader(
    @Args({ name: 'file', type: () => GraphQLUpload })
    { createReadStream, filename, mimetype }: FileUpload,
    @Args('target') target: string,
  ): Promise<string> {
    console.log('Mutation: imageUploader');
    console.log('filename:', filename);
    console.log('mimetype:', mimetype);
    assertGenericUploadTarget(target);
    return saveImageUpload({ createReadStream, filename, mimetype }, target);
  }

  @UseGuards(AuthGuard)
  @Mutation((returns) => [String])
  public async imagesUploader(
    @Args('files', { type: () => [GraphQLUpload] })
    files: Promise<FileUpload>[],
    @Args('target') target: string,
  ): Promise<string[]> {
    console.log('Mutation: imagesUploader');

    const uploadedImages: string[] = [];
    assertGenericUploadTarget(target);
    const promisedList = files.map(
      async (img: Promise<FileUpload>, index: number): Promise<void> => {
        try {
          uploadedImages[index] = await saveImageUpload(await img, target);
        } catch (err) {
          console.log('Error, file missing!');
        }
      },
    );

    await Promise.all(promisedList);
    return uploadedImages;
  }
}
