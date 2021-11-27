<template>
  <el-row style="height:100%">
    <!-- 文集列表 -->
    <el-col :span="5" class="project-list-container">
        <div class="project-list-name">文集列表 <i class="refresh-project-list" :class="refresh_project_icon" @click="refreshProjectList()"></i></div>
        <div class="create-btn-div">
          <el-input
            v-model="search_project_kw"
            placeholder="搜索文集"
            size="small"
            prefix-icon="el-icon-search"
            @keyup.enter.native="searchProject"
            >
          </el-input>
          <el-tooltip class="item" effect="dark" content="新建文集" placement="bottom">
            <el-button style="margin-left:5px;" size="small" icon="el-icon-plus" circle type="primary" @click="dialogCreateProjectVisible = true"></el-button>
          </el-tooltip>
        </div>
        <el-scrollbar class="item-scrollbar" v-loading="project_list_loading">
          <div class="project-item" :class="current_project==item.name?'current-project':''" v-for="(item) in project_list" :key="item.id" @click="getProjectDocs(item.id,item.name)">
            <i class="el-icon-folder-opened"></i> {{item.name}}
          </div>
        </el-scrollbar>
        <div class="project-list-bottom">合计：{{projectCnt}} 个文集</div>
    </el-col>
    <!-- 文集列表结束 -->
    <!-- 文档列表 -->
    <el-col :span="6" class="doc-list-container" v-if="noDocList">
      <el-empty description="本来无一物" ></el-empty>
    </el-col>
    <el-col :span="6" class="doc-list-container" v-loading="doc_list_loading" v-else>
        <div class="doc-search-input">
          <el-input
            v-model="search_doc_kw"
            placeholder="搜索文档"
            size="small"
            prefix-icon="el-icon-search"
            @keyup.enter.native="searchDoc"
            >
          </el-input>
          <el-tooltip class="item" effect="dark" content="新建文档" placement="bottom">
            <el-button style="margin-left:5px;" size="small" icon="el-icon-plus" circle @click="createDoc"></el-button>
          </el-tooltip>
        </div>
        <el-scrollbar class="item-scrollbar">
          <div v-for="(item) in current_doc_list" :key="item.id" :class="current_doc.id==item.id?'current-doc':''" class="doc-item" @click="getDoc(item.id)">
            <i class="el-icon-tickets"></i>
              {{item.name}}
            <div class="doc-item-time">{{item.create_time | dateFomart}}</div>
          </div>
        </el-scrollbar>
    </el-col>
    <!-- 文档列表结束 -->
    <!-- 编辑器 -->
    <el-col :span="13" class="editor-container" v-loading="doc_loading">
      <div class="doc-info">
        <el-breadcrumb separator="/">
          <el-breadcrumb-item>{{current_project}}</el-breadcrumb-item>
          <el-breadcrumb-item>{{current_doc.name}}</el-breadcrumb-item>
        </el-breadcrumb>
      </div>
      <div class="doc-operate-btn">
        <el-input v-model="current_doc.name" size="mini" style="width: 300px;padding-right:10px;" placeholder="请输入文档标题"></el-input>
        <el-button type="normal" size="mini" v-if="isCreateDoc" @click="pubDoc">发布文档</el-button>
        <el-button type="normal" size="mini" v-if="isModifyDoc" @click="modifyDoc">保存修改</el-button>
      </div>
      <div class="editor">
        <textarea id="editor"></textarea>
      </div>
    </el-col>
    <!-- 编辑器结束 -->
    <!-- 新建文集弹出框 -->
    <el-dialog title="新建文集" :visible.sync="dialogCreateProjectVisible">
      <el-form :model="createProjectForm">
        <el-form-item label="文集名称">
          <el-input v-model="createProjectForm.name" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="文集简介">
          <el-input type="textarea" v-model="createProjectForm.desc"></el-input>
        </el-form-item>
        <el-form-item label="文集权限">
          <el-radio v-model="createProjectForm.role" label="0">私密</el-radio>
          <el-radio v-model="createProjectForm.role" label="1">公开</el-radio>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogCreateProjectVisible = false" size="small" round>取 消</el-button>
        <el-button type="primary" @click="createProject" size="small" round>确 定</el-button>
      </div>
    </el-dialog>
    <!-- 新建文集弹出框结束 -->
  </el-row>
</template>

<script>
import Store from 'electron-store';
import SimpleMDE from 'simplemde';
import { marked } from 'marked';

export default {
  name: 'Home',
  components: {

  },
  computed:{
    projectCnt(){
      return this.project_list.length;
    }
  },
  data() {
    return {
      store:new Store(),
      project_list : [],// 文集列表
      project_list_loading:true, // 文集列表是否加载
      current_project:"", // 当前文集
      current_project_id:"", // 当前文集ID
      refresh_project_icon:"el-icon-refresh", 
      noDocList:true, // 文档列表状态
      current_doc_list : [], // 当前文档列表
      doc_list_loading:false, // 文档列表是否加载
      current_doc:"", // 当前文档
      doc_loading:false,
      noDoc:true, // 文档状态
      search_doc_kw:'',
      search_project_kw:'',
      host_url:'',
      user_token : '',
      dialogCreateProjectVisible:false,// 新建文集弹出框可访问性
      createProjectForm:{name:'',desc:'',role:'1'},
      isCreateDoc:false,
      isModifyDoc:false,
    }
  },
  watch: {

  },
  mounted() {
    this.init();
    // 设置是否渲染输入的html
      marked.setOptions({sanitize: true});
  },
  methods: {
    // 页面初始化
    init(){
        // 读取配置 
        this.host_url = this.store.get('mrdocUrl');
        this.user_token = this.store.get('mrdocUserToken');
        this.getProjectList();
        this.initEditor();
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
        fetch(this.host_url + '/api/get_projects/?sort=1&token='+this.user_token)
        .then((r)=>{
            return r.json()
        })
        .then(r=>{
            console.log(r)
            if(r.status){
                this.current_project = '';
                this.project_list = r.data;
                this.project_list_loading = false;
                this.noDocList = true;
            }else{
                this.$message("获取文集列表失败")
            }
        }).catch(()=>{
            this.$message("获取文集列表异常!")
        })
    },
    // 获取指定文集的文档列表
    getProjectDocs(id,name){
      this.doc_list_loading = true;
      this.current_project = name;
      this.current_project_id = id;
      this.current_doc = ""
      this.noDoc = true;
      this.simplemde.value("");
      fetch(this.host_url + '/api/get_docs/?sort=1&token='+this.user_token+"&pid="+id)
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
    // 刷新当前文集的文档列表
    refreshDocs(){
      fetch(this.host_url + '/api/get_docs/?sort=1&token='+this.user_token+"&pid="+this.current_project_id)
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
                this.isCreateDoc = false;
                this.isModifyDoc = true;
                this.simplemde.value(r.data.md_content);
            }else{
                this.$message("获取文档失败")
            }
        }).catch((error)=>{
          console.log(error)
            this.$message("获取文档异常!")
        })
    },
    // 刷新文集列表
    refreshProjectList(){
      this.refresh_project_icon = "el-icon-loading";
      this.project_list_loading = true;
      this.getProjectList();
      this.refresh_project_icon = 'el-icon-refresh'
    },
    // 新建文集
    createProject(){
      if(this.createProjectForm.name == ''){
        this.$message({message:"文集名称不能为空！",type:"error"})
      }else{
        let formData = new FormData();
        for (var key in this.createProjectForm)
        {
            formData.append(key,this.createProjectForm[key]);
        }
        fetch(this.host_url + '/api/create_project/?token='+this.user_token,{
          method:'POST',
          mode:'cors',
          body:formData
        })
        .then((r)=>{
          return r.json()
        })
        .then(r=>{
          console.log(r)
          if(r.status){
            this.dialogCreateProjectVisible = false;
            this.$message({message:"创建成功",type:"success"})
            this.refreshProjectList()
          }else{
            this.$message({message:r.data,type:"error"})
          }
        })
        .catch(error=>{
          console.log(error)
        })
      }
    },
    // 新建文档
    createDoc(){
      this.isCreateDoc = true;
      if(this.isModifyDoc){
        this.isModifyDoc = false;
        this.simplemde.value("");
      }
      this.current_doc = {name:'',pre_content:'这里写文档'}
      
    },
    // 发布文档
    pubDoc(){
      this.doc_loading = true;
      let docData = new FormData();
      docData.append('pid',this.current_project_id);
      docData.append('title',this.current_doc.name);
      docData.append('doc',this.simplemde.value());
      console.log(docData)
      
      fetch(this.host_url + '/api/create_doc/?token='+this.user_token,{
        method:'POST',
        mode:'cors',
        body:docData
      })
      .then((r)=>{
        this.doc_loading = false;
        return r.json()
      })
      .then(r=>{
        console.log(r)
        if(r.status){
          this.isCreateDoc = false;
          this.isModifyDoc = true;
          this.current_doc.id = r.data;
          this.refreshDocs();
          this.$message({message:"发布成功",type:"success"})
        }else{
          this.$message({message:r.data,type:"error"})
        }
      })
      .catch(error=>{
        console.log(error)
      })
    },
    // 修改文档
    modifyDoc(){
      this.doc_loading = true;
      let docData = new FormData();
      docData.append('pid',this.current_project_id);
      docData.append('did',this.current_doc.id);
      docData.append('title',this.current_doc.name);
      docData.append('doc',this.simplemde.value());
      console.log(docData)
      
      fetch(this.host_url + '/api/modify_doc/?token='+this.user_token,{
        method:'POST',
        mode:'cors',
        body:docData
      })
      .then((r)=>{
        this.doc_loading = false;
        return r.json()
      })
      .then(r=>{
        console.log(r)
        if(r.status){
          this.$message({message:"修改成功",type:"success"})
        }else{
          this.$message({message:r.data,type:"error"})
        }
      })
      .catch(error=>{
        console.log(error)
      })
    },
    // 搜索文集
    searchProject(){
      if(this.search_project_kw == ''){
        this.getProjectList();
      }else{
        var search_project_list = [];
        for(let i = 0;i < this.project_list.length; i ++){
          if(this.project_list[i].name.indexOf(this.search_project_kw) != -1){
            console.log(this.project_list[i].name)
            search_project_list.push(this.project_list[i])
          }
        }
        if(search_project_list.length == 0){
          console.log("无搜索结果")
        }else{
          this.project_list = search_project_list;
        }
      }
    },
    // 搜索文档
    searchDoc(){
      if(this.search_doc_kw == ''){
        this.getProjectDocs(this.current_project_id,this.current_project);
      }else{
        var search_doc_list = [];
        for(let i = 0;i < this.current_doc_list.length; i ++){
          if(this.current_doc_list[i].name.indexOf(this.search_doc_kw) != -1){
            search_doc_list.push(this.current_doc_list[i])
          }
        }
        if(search_doc_list.length == 0){
          console.log("无搜索结果")
        }else{
          this.current_doc_list = search_doc_list;
        }
      }
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
    height: calc(100% - 100px);
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
    margin-bottom: 5px;
  }
  .current-project{
    font-weight: 700;
  }
  .refresh-project-list{
    cursor: pointer;
  }
  .project-item{
    padding: 5px;
    /* margin-bottom: 5px; */
  }
  .project-item:hover{
    background-color: #f9f9f9;
    cursor: pointer;
  }
  .create-btn-div{
    display: flex;
    justify-content: space-between;
    padding-bottom: 5px;
    text-align: center;
    /* border-bottom: 2px #999999 solid; */
  }
  .project-list-bottom{
    margin-top: 5px;
    margin-left: 5px;
    font-size: 12px;
    /* text-align: center; */
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
    display: flex;
    justify-content: space-between;
  }
  .doc-item{
    border-bottom: 1px #f5f5f5 solid;
    padding: 5px;
    cursor: pointer;
  }
  .current-doc{
    font-weight: 700;
  }
  .doc-item:hover{
    background-color: #f5f5f5;
  }
  .doc-item-time{
    font-size: 14px;
    color: #999999;
  }
  .doc-operate-btn{
    margin-top: 10px;
  }
  .editor-container{
    padding: 10px;
    height: 100%;
  }
  .editor{
    margin-top: 10px;
    height: calc(100% - 80px);
  }
  .CodeMirror{
    height: calc(100% - 80px);
  }
  .CodeMirror .cm-spell-error:not(.cm-url):not(.cm-comment):not(.cm-tag):not(.cm-word){
    background: none;
  }
  /* simplemde 预览样式 */
  .editor-preview-side>p, .editor-preview>p{
    margin-bottom: 16px;
  }
</style>