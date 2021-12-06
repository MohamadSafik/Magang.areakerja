<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Presensi extends Model
{
    use HasFactory;
    protected $table = "presensi";
    protected $primaryKey = "id";
    protected $fillable = [
        'id','user_id','tgl','jammasuk','jamkeluar','jammasuk_kembali','jampulang','jamkerja','aktivitas_log', 'status', 'keterangan_masuk', 'keterangan_istirahat', 'keterangan_kembali', 'keterangan_pulang'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}