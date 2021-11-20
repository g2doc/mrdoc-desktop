<template>
  <!-- <el-container style="background-color: #f5f5f5;height:100%;"> -->
    <el-row style="height:100%">
      <!-- 文集列表 -->
      <el-col :span="6" class="project-list-container" v-loading="project_list_loading">
          <div class="project-list-name">文集列表</div>
          <el-scrollbar class="item-scrollbar">
            <div class="project-item" v-for="(item) in project_list" :key="item.id" @click="getProjectDocs(item.id)">
              <i class="el-icon-folder-opened"></i> {{item.name}}
            </div>
          </el-scrollbar>
      </el-col>
      <!-- 文档列表 -->
      <el-col :span="6" class="doc-list-container" v-if="noDocList">
        <el-empty description="本来无一物" ></el-empty>
      </el-col>
      <el-col :span="6" class="doc-list-container" v-loading="doc_list_loading" v-else>
          <div class="doc-search-input">
            <el-input
              placeholder="搜索文档"
              prefix-icon="el-icon-search"
              >
            </el-input>
          </div>
          <el-scrollbar class="item-scrollbar">
            <div v-for="(item) in current_doc_list" :key="item.id" class="doc-item" @click="getDoc(item.id)">
              <i class="el-icon-tickets"></i> {{item.name}}
              <div class="doc-item-time">更新于：{{item.create_time | dateFomart}}</div>
            </div>
          </el-scrollbar>
          
      </el-col>
      <!-- 编辑器 -->
      <el-col :span="12" class="editor-container" v-if="noDoc">
        <el-empty description="处处皆尘埃" ></el-empty>
      </el-col>
      <el-col :span="12" class="editor-container" v-else v-loading="doc_loading">
        <div class="doc-info">
          <el-breadcrumb separator="/">
            <el-breadcrumb-item>测试文集</el-breadcrumb-item>
            <el-breadcrumb-item>部署手册</el-breadcrumb-item>
            <el-breadcrumb-item>Linux部署指南</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <div class="editor">
          <textarea id="editor"></textarea>
        </div>
      </el-col>
    </el-row>
  <!-- </el-container> -->
</template>

<script>
import SimpleMDE from 'simplemde';
// import marked from 'marked';

export default {
  name: 'Home',
  components: {

  },
  data() {
    return {
      project_list : [],// 文集列表
      project_list_loading:true, // 文集列表是否加载
      current_project:"", // 当前文集
      noDocList:true, // 文档列表状态
      current_doc_list : [], // 当前文档列表
      doc_list_loading:false, // 文档列表是否加载
      current_doc:"", // 当前文档
      doc_loading:false,
      noDoc:false, // 文档状态
      host_url:'http://192.168.0.101',
      user_token : '62f8de856fcbefc554d3162637ba167386228adad381656873cc02af',
    }
  },
  watch: {

  },
  mounted() {
    this.init()
  },
  methods: {
    // 页面初始化
    init(){
        this.getProjectList();
        this.initEditor()
    },
    // 初始化编辑器
    initEditor(){
      // 实例化编辑器
      this.simplemde = new SimpleMDE({
        element: document.getElementById("editor")
      });
    },  
    // 获取文集列表
    getProjectList(){
        fetch(this.host_url + '/api/get_projects/?token='+this.user_token)
        .then((r)=>{
            return r.json()
        })
        .then(r=>{
            console.log(r)
            if(r.status){
                this.project_list = r.data;
                this.project_list_loading = false;
            }else{
                this.$message("获取文集列表失败")
            }
        }).catch(()=>{
            this.$message("获取文集列表异常!")
        })
    },
    // 获取指定文集的文档列表
    getProjectDocs(id){
      this.doc_list_loading = true;
      fetch(this.host_url + '/api/get_docs/?token='+this.user_token+"&pid="+id)
        .then((r)=>{
            return r.json()
        })
        .then(r=>{
            console.log(r)
            if(r.status){
                this.current_doc_list = r.data;
                this.doc_list_loading = false;
                this.noDocList = false;
            }else{
                this.$message("获取文档列表失败")
            }
        }).catch(()=>{
            this.$message("获取文档列表异常!")
        })
    },
    // 获取文档内容
    getDoc(id){
      this.doc_loading = true;
      fetch(this.host_url + '/api/get_doc/?token='+this.user_token+"&did="+id)
        .then((r)=>{
            return r.json()
        })
        .then(r=>{
            console.log(r)
            if(r.status){
                this.current_doc = r.data;
                this.doc_loading = false;
                this.noDoc = false;
                this.simplemde.value(r.data.md_content)
            }else{
                this.$message("获取文档失败")
            }
        }).catch((error)=>{
          console.log(error)
            this.$message("获取文档异常!")
        })
    },
  },
  filters:{
    // 日期格式化
    dateFomart:function(date){
      let dt = new Date(date);//实例化时间对象
      let y = dt.getFullYear();
      let m = dt.getMonth() + 1;
      let d = dt.getDate(); 
        //笨方法  return y + '-' + m + '-' + d
        //官方方法  注意引号，是tab键上面的符号（ES6的语法）
        return `${y}-${m}-${d}`    
      //  return `${m}-${d}`  
			}
		},
}
</script>

<style>
@import '~simplemde/dist/simplemde.min.css';
  /*  */
  .el-scrollbar__wrap{
    overflow-x: hidden;
  }
  .item-scrollbar{
    height: calc(100% - 50px);
    /* overflow: scroll; */
  }
  .project-list-container{
    background-color: #f5f5f5;
    height: 100%;
    padding-left:10px;
    padding-right: 10px;
    padding-top: 10px;
  }
  .project-list-name{
    text-align: center;
    font-size:16px;
    font-weight: 700;
    padding-bottom: 10px;
    margin-bottom: 10px;
  }
  .project-item{
    padding: 5px;
    /* margin-bottom: 5px; */
  }
  .project-item:hover{
    background-color: #f9f9f9;
    cursor: pointer;
  }
  .doc-list-container{
    height: 100%;
    background-color: #ffffff;
    border-right: 2px #f5f5f5 solid;
    padding-left:10px;
    padding-right: 10px;
    padding-top: 10px;
  }
  .doc-search-input{
    margin-bottom: 10px;
  }
  .doc-item{
    border-bottom: 1px #f5f5f5 solid;
    padding: 5px;
    cursor: pointer;
  }
  .doc-item:hover{
    background-color: #f5f5f5;
  }
  .doc-item-time{
    font-size: 14px;
    color: #999999;
  }
  .editor-container{
    padding: 10px;
    height: 100%;
  }
  .editor{
    margin-top: 15px;
    height: calc(100% - 80px);
  }
  .CodeMirror{
    height: calc(100% - 100px);
  }
</style>