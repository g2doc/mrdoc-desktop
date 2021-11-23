<template>
    <div class="container">
        <!-- 标题 -->
        <div class="title">
            <h2>MrDoc 桌面客户端配置中心</h2>
        </div>
        <!-- 表单 -->
        <el-form ref="form" :model="form" label-width="90px">
            <el-form-item label="MrDoc 地址">
                <el-input v-model="form.mrdocUrl"></el-input>
            </el-form-item>
            <el-form-item label="用户 Token">
                <el-input v-model="form.mrdocUserToken"></el-input>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click="checkToken">验证</el-button>
                <el-button type="primary" @click="onSubmit">保存</el-button>
                <el-button type="normal" @click="onBack">返回</el-button>
            </el-form-item>
        </el-form>
    </div>
</template>
<script>
  import Store from "electron-store";
  export default {
    data() {
      return {
        form: {
          mrdocUrl: '',
          mrdocUserToken: '',
        },
        store:new Store()
      }
    },
    mounted(){
        this.initData();
    },
    methods: {
        // 读取配置
        initData(){
            // const store = new Store();
            this.form.mrdocUrl = this.store.get('mrdocUrl');
            this.form.mrdocUserToken = this.store.get('mrdocUserToken');
            console.log(this.mrdocUrl)
        },
      // 保存配置
      onSubmit() {
        console.log('submit!');
        this.store.set('mrdocUrl',this.form.mrdocUrl);
        this.store.set('mrdocUserToken',this.form.mrdocUserToken);
        this.$message({message:"保存成功！",type: 'success'})
      },
      // 验证配置
      checkToken(){
          fetch(this.form.mrdocUrl+'/api/get_projects/?token='+this.form.mrdocUserToken)
          .then((r)=>{
              return r.json()
          })
          .then(r=>{
            // console.log(r)
            if(r.status){
                this.$message({message:"验证成功！",type: 'success'})
            }else{
                this.$message({message:"验证失败！",type: 'error'})
            }
          }).catch(()=>{
                this.$message({message:"验证出错！",type: 'error'})
          })
      },
      // 返回首页
      onBack(){
          this.$router.push({'name':"Home"})
      },
    }
  }
</script>
<style scope>
    .container{
        padding: 10px;
    }
    .title{
        margin-bottom: 10px;
        text-align: center;
    }
</style>